# Aurassure technical-support inquiry — English version

**Status:** Draft prepared on 3 November 2026. **NOT SENT.**
**Primary routing:** Daniel Rios De Rosa — Aurassure Brasil, named as the API integration contact in the UFF Volta Redonda manual (no verified individual email provided). **Corporate alternative:** contact@aurassure.com.
**Technical support telephone:** +91 90780 32911.
**Subject:** Validation request — Volta Redonda UFF monitoring stations (API units, AQI, QA, outages)

Dear Daniel Rios De Rosa and Aurassure Brasil Technical Support Team,

The UFF SEMEAR project in Volta Redonda, Rio de Janeiro, Brazil, is integrating Aurassure air-quality data for the following three stations:

- Thing 46560 — UFF / Vila Santa Cecília
- Thing 46561 — IFRJ / Nossa Senhora das Graças
- Thing 46562 — CRIAAD / Vila Mury

The API integration and private historical ingestion are operational. We are withholding concentration values from our public portal pending formal technical validation. Could you please address the following points and share supporting documentation?

**1. Actual units in aggregated API responses.** The stations-list metadata specifies display unit ppb for NO2, SO2 and O3 and default unit µg/m³; for CO it reports ppb and mg/m³ respectively. The data response contains average values without a unit beside each measurement. Which unit applies to the actual reported averages, including historical values? Are conversions dependent on specified temperature and pressure? Are PM2.5 and PM10 averages supplied in µg/m³ as the metadata suggests?

**2. AQI standard.** What exact AQI formula, national reference, breakpoints, averaging windows, validity criteria and controlling pollutant are configured for these three Brazilian stations? How should missing AQI fields be interpreted? Your general public explanation references Indian air-quality-index conventions, but we do not assume that they apply to this installation.

**3. Station instrumentation and calibration.** Please identify the equipment and sensor modules actually installed at each of the three stations, firmware versions, calibration/collocation certificates, correction methods, precision or uncertainty, invalid-data/warm-up flags and maintenance history. Is PM1 installed and enabled? It was not present in our retrieved records.

**4. Data gaps and an unexplained gas-value pattern.** The CRIAAD records have a gap from 27 October 2026 05:45 to 29 October 2026 16:30 (São Paulo local time, UTC−03:00). The first three 15-minute averages after this 58h45 interval show a substantial simultaneous decline in the reported NO2, SO2 and CO values. PM2.5 changes comparatively little. We are not assuming either a sensor problem or a real pollution episode. Can you check diagnostic, restart, connection, calibration and quality-control records, particularly around 29 October 16:00–17:30?

All three stations also have absent records after 21 October 18:00 until different times on 22 October. Was there any common connectivity, infrastructure or platform event?

**Additional exploratory pattern for engineering review.** Across all three stations there were seven resumptions after gaps of at least five hours for which three consecutive 15-minute averages were available. Six of seven showed a joint SO2 decline greater than 50% and CO decline greater than 30% over 30 minutes. In CRIAAD specifically, this occurred in five out of five such resumptions, versus 23 out of 694 ordinary 30-minute windows with initially positive SO2 and CO values (3.3%). The thresholds were selected during exploratory analysis, the observations are temporally dependent, and these proportions are NOT a calibrated fault rate or a formal causal test. Could you provide restart/warm-up diagnostics, raw sensor-channel outputs, validity flags and correction-model logs that could help distinguish instrument stabilization from environmental events?

**5. Licence and API operation.** May the UFF SEMEAR public portal reproduce attributed historical observations and provide CSV export? Please clarify the API rate limits, backfill and retention policy, late data corrections, timezone conventions and any required attribution, permissions or licensing conditions.

We intend to distinguish the supplementary Aurassure/UFF network from the official Brazilian INEA monitoring network, and will not assign national IQAr categories or emission sources without independent evidence.

Thank you for your assistance. We can provide sanitized sample records and timestamps without disclosing any access credentials.

Kind regards,

SEMEAR SF technical integration team
UFF SEMEAR — Volta Redonda, Rio de Janeiro, Brazil

---

## Operator notes (do not send)
- Confirm the organizational signatory and whether UFF should co-sign this request.
- Aurassure's official contact page: https://aurassure.com/contact_aurassure/
- Aurassure's general AQI explanation: https://aurassure.com/air-quality-index/
- Never attach API keys, bridge tokens, Vault exports or secret environment variables.
- After receiving a reply, archive the correspondence in the canonical technical dossier and record what was explicitly verified versus pending.


**Internal routing update:** The original three-page `Manual_API_UFF_Volta_Redonda (1).pdf` identifies Daniel Rios De Rosa as the Aurassure Brasil integration contact. A public professional profile corroborates the company relationship (https://br.linkedin.com/in/daniel-rios-de-rosa/en). Do not invent a direct email address; use an established UFF/Aurassure channel or forward via the corporate support inbox. The Portuguese inquiry is the preferred first-contact document for the Brazilian recipient. No message has been sent.
