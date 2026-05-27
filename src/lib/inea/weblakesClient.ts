import { SITES, PARAMETERS } from './weblakesDictionary';

const DEFAULT_USER_AGENT = "SEMEAR-VR-Abandonada-RadarDoAr/0.1 contato: alexandre.martins@pwa.semear";
const DEFAULT_HOST = "qualidadedoar.inea.rj.gov.br";

export interface FetchParams {
  stationId: string;
  parameterId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface RawCellRow {
  id: number;
  cell: (string | number)[];
}

export interface RawGridResponse {
  total: number;
  page: number;
  records: number;
  rows: RawCellRow[];
}

export interface NormalizedRow {
  source: string;
  source_system: string;
  station_id: string;
  station_name: string;
  parameter_id: string;
  pollutant: string;
  datetime: string;
  value: number | null;
  unit: string;
  wind_speed: number | null;
  wind_direction: number | null;
  qaqc: null;
  is_public_platform_data: boolean;
  validation_status: string;
  raw: RawCellRow;
}

export function cleanHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, '').trim();
}

export function extractAttr(html: string, attr: string): string | null {
  const regex = new RegExp(`${attr}=['"]([^'"]+)['"]`);
  const match = html.match(regex);
  return match ? match[1] : null;
}

export function parseDataValueSpan(html: string): string {
  const attr = extractAttr(html, "data-value");
  return attr !== null ? attr : cleanHtml(html);
}

export function parseNumber(html: string): number | null {
  const str = parseDataValueSpan(html);
  if (!str) return null;
  const normalizedStr = str.replace(',', '.');
  const num = parseFloat(normalizedStr);
  return isNaN(num) ? null : num;
}

async function fetchWithManualRedirects(
  url: string,
  headers: Record<string, string>,
  userAgent: string
): Promise<{ res: Response; body: string; cookies: string }> {
  let currentUrl = url;
  let currentCookies = headers['Cookie'] || '';
  let redirectCount = 0;
  const maxRedirects = 10;

  while (redirectCount < maxRedirects) {
    const requestHeaders: Record<string, string> = { 
      ...headers,
      "User-Agent": userAgent
    };
    if (currentCookies) {
      requestHeaders['Cookie'] = currentCookies;
    }

    const res = await fetch(currentUrl, {
      method: 'GET',
      headers: requestHeaders,
      redirect: 'manual'
    });

    const setCookies = res.headers.getSetCookie();
    if (setCookies.length > 0) {
      const newCookies = setCookies.map(c => c.split(';')[0]).join('; ');
      if (currentCookies) {
        const cookieMap = new Map<string, string>();
        currentCookies.split(';').forEach(pair => {
          const parts = pair.split('=');
          if (parts.length >= 2) {
            cookieMap.set(parts[0].trim(), parts.slice(1).join('=').trim());
          }
        });
        newCookies.split(';').forEach(pair => {
          const parts = pair.split('=');
          if (parts.length >= 2) {
            cookieMap.set(parts[0].trim(), parts.slice(1).join('=').trim());
          }
        });
        currentCookies = Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
      } else {
        currentCookies = newCookies;
      }
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) {
        throw new Error(`Redirect status ${res.status} without location header`);
      }
      currentUrl = new URL(location, currentUrl).toString();
      redirectCount++;
    } else {
      const body = await res.text();
      return { res, body, cookies: currentCookies };
    }
  }
  throw new Error('Redirect count exceeded in manual redirect handler');
}

export async function initPublicSession(
  host = DEFAULT_HOST,
  userAgent = DEFAULT_USER_AGENT
): Promise<string> {
  const landingUrl = `https://${host}/INEAPublico/NavPage/Index/Analytics?aGroupId=NPSEARCH`;
  const result = await fetchWithManualRedirects(landingUrl, {}, userAgent);
  
  let cookies = result.cookies;
  if (cookies) {
    cookies += "; lkTimeZone=180,America/Sao_Paulo";
  } else {
    cookies = "lkTimeZone=180,America/Sao_Paulo";
  }
  return cookies;
}

export async function fetchConcentrationWithWindArrows(
  host = DEFAULT_HOST,
  cookies: string,
  params: FetchParams,
  userAgent = DEFAULT_USER_AGENT
): Promise<string> {
  const pathPrefix = "/INEAPublico";
  const controller = "ConcentrationWithWindArrows";
  
  // 1. Align station
  await fetchWithManualRedirects(
    `https://${host}${pathPrefix}/AmbientAnalyticsReports/StoreSelectedFieldKey?aControllerName=${controller}&aFieldName=AmbientStationKeyGrouped&aSelectedKey=${params.stationId}&Context_Bootstrap_Flag=true`,
    { "Cookie": cookies },
    userAgent
  );
  
  // 2. Align parameter
  await fetchWithManualRedirects(
    `https://${host}${pathPrefix}/AmbientAnalyticsReports/StoreSelectedFieldKey?aControllerName=${controller}&aFieldName=AmbientPollutantParameterKey&aSelectedKey=${params.parameterId}&Context_Bootstrap_Flag=true`,
    { "Cookie": cookies },
    userAgent
  );

  // 3. Align date range
  await fetchWithManualRedirects(
    `https://${host}${pathPrefix}/AmbientAnalyticsReports/UpdateDateRange?aControllerName=${controller}&aDateLabel=&aDateLabelFieldName=HIVE_FLD_NAME_DATEOPTION&aStartFieldName=HIVE_FLD_NAME_STARTDATE&aEndFieldName=HIVE_FLD_NAME_ENDDATE&aStartDate=${params.startDate}&aEndDate=${params.endDate}&Context_Bootstrap_Flag=true`,
    { "Cookie": cookies },
    userAgent
  );

  // 4. Retrieve JqGrid GridData
  const queryParams = new URLSearchParams({
    aParameterKey: params.parameterId,
    aSite: params.stationId,
    aStartDate: params.startDate,
    aEndDate: params.endDate,
    gridId: "ConcentrationWithWindArrowsGrid",
    Context_Bootstrap_Flag: "true",
    _search: "false",
    nd: String(Date.now()),
    rows: "1500",
    page: "1",
    sidx: "DateTime",
    sord: "asc",
    ssSearchField: "__ANY_COLUMN",
    ssSearchOper: "cn",
    ssSearchString: ""
  });
  
  const targetUrl = `https://${host}${pathPrefix}/${controller}/GridData?${queryParams.toString()}`;
  const gridResult = await fetchWithManualRedirects(targetUrl, {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Referer": `https://${host}${pathPrefix}/${controller}?aSectionId=Analytics`,
    "X-Requested-With": "XMLHttpRequest",
    "Cookie": cookies
  }, userAgent);

  if (gridResult.res.status !== 200) {
    throw new Error(`Failed to fetch GridData: HTTP ${gridResult.res.status}`);
  }
  return gridResult.body;
}

export function parseJqGridRows(responseBody: string): RawCellRow[] {
  const data = JSON.parse(responseBody) as RawGridResponse;
  if (!data || !Array.isArray(data.rows)) {
    return [];
  }
  return data.rows;
}

export function normalizeConcentrationRow(
  row: RawCellRow,
  context: FetchParams
): NormalizedRow {
  const stationInfo = SITES[context.stationId] || { name: `Estação ${context.stationId}` };
  const paramInfo = PARAMETERS[context.parameterId] || { pollutant: `Poluente ${context.parameterId}`, unit: "N/A" };

  if (!Array.isArray(row.cell) || row.cell.length < 8) {
    throw new Error(`Invalid row cells length: expected at least 8 elements, got ${row.cell?.length || 0}`);
  }

  // cell[2] = datetime span
  // cell[5] = concentration span
  // cell[6] = wind speed span
  // cell[7] = wind direction span
  const cellDateHtml = String(row.cell[2]);
  const cellValHtml = String(row.cell[5]);
  const cellWindSpeedHtml = String(row.cell[6]);
  const cellWindDirHtml = String(row.cell[7]);

  const datetime = parseDataValueSpan(cellDateHtml);
  const value = parseNumber(cellValHtml);
  const wind_speed = parseNumber(cellWindSpeedHtml);
  const wind_direction = parseNumber(cellWindDirHtml);

  return {
    source: "INEA",
    source_system: "WEBLAKES_CONCENTRATION_WITH_WIND",
    station_id: context.stationId,
    station_name: stationInfo.name,
    parameter_id: context.parameterId,
    pollutant: paramInfo.pollutant,
    datetime: datetime,
    value: value,
    unit: paramInfo.unit,
    wind_speed: wind_speed,
    wind_direction: wind_direction,
    qaqc: null,
    is_public_platform_data: true,
    validation_status: "NO_EXPLICIT_QAQC_IN_TABLE",
    raw: row
  };
}
