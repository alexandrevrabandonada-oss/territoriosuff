-- Exploratory evidence only: correlated 30-minute gas changes after 5h+ gaps.
-- The vendor has not validated unit semantics, instrument warm-up, or causality.

create or replace view aurassure_internal.post_gap_gas_review
with (security_invoker = true) as
select
 g.station_id,
 g.last_measured_at as before_gap,
 g.next_measured_at as after_gap,
 g.interval_hours,
 s0.no2 as no2_at_resume,
 s2.no2 as no2_after_30m,
 s0.so2 as so2_at_resume,
 s2.so2 as so2_after_30m,
 s0.co as co_at_resume,
 s2.co as co_after_30m,
 s0.pm25 as pm25_at_resume,
 s2.pm25 as pm25_after_30m,
 case when s0.so2>0 and s2.so2 is not null
  then round((100 * (1 - s2.so2 / s0.so2))::numeric,1) end as so2_drop_pct,
 case when s0.co>0 and s2.co is not null
  then round((100 * (1 - s2.co / s0.co))::numeric,1) end as co_drop_pct,
 (s0.so2>0 and s0.co>0
  and s2.so2 < s0.so2*0.5
  and s2.co < s0.co*0.7) as meets_exploratory_joint_threshold,
 'exploratory_unverified_vendor_units_no_causal_inference'::text as quality_note
from aurassure_internal.measurement_gaps g
join public.aurassure_measurements_staging s0
 on s0.station_id=g.station_id and s0.measured_at=g.next_measured_at
 and s0.aggregation_period_seconds=900
left join public.aurassure_measurements_staging s2
 on s2.station_id=g.station_id
 and s2.measured_at=g.next_measured_at+interval '30 minutes'
 and s2.aggregation_period_seconds=900
where g.interval_hours >= 5;
revoke all on aurassure_internal.post_gap_gas_review from public,anon,authenticated;
grant select on aurassure_internal.post_gap_gas_review to service_role;

-- One review-only annotation on the first available observation after each major gap.
-- We do NOT label measurements as instrumental failures or as validated pollution episodes.
insert into public.aurassure_qa_annotations (
 station_id,measured_at,averaging_period_seconds,flag_code,review_status,
 severity,rationale,evidence
)
select
 station_id,after_gap,900,
 'post_gap_30min_gas_pattern_review','open','review_required',
 'First sample following a gap of 5h or more. Review gas behavior over the next 30min with original station diagnostics, warm-up records, unit conversions and external context before interpretation. Pattern does NOT establish sensor fault or exclude a real environmental event.',
 jsonb_build_object(
  'preceding_gap_hours',round(interval_hours::numeric,2),
  'before_gap_utc',before_gap,
  'after_gap_utc',after_gap,
  'so2_drop_percent_30m',so2_drop_pct,
  'co_drop_percent_30m',co_drop_pct,
  'exploratory_joint_drop_threshold_met',meets_exploratory_joint_threshold,
  'initial_co_vendor_units',co_at_resume,
  'initial_so2_vendor_units',so2_at_resume,
  'sample_origin','Aurassure raw snapshots linked via private staging',
  'causality','not established',
  'unit_validation','pending'
 )
from aurassure_internal.post_gap_gas_review
where so2_after_30m is not null and co_after_30m is not null
on conflict (station_id,measured_at,averaging_period_seconds,flag_code) do nothing;
