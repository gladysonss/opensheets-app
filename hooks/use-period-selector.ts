"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { 
  getPeriodType, 
  parsePeriodParamExtended, 
  PeriodType,
  formatPeriod,
  parsePeriod
} from "@/lib/utils/period";

const PERIOD_PARAM = "periodo";

export function usePeriodSelector() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const periodParam = searchParams.get(PERIOD_PARAM);
  
  // Parse current period from URL or default to current month
  const currentPeriod = useMemo(() => {
    return parsePeriodParamExtended(periodParam);
  }, [periodParam]);

  const currentType = useMemo(() => {
    return getPeriodType(currentPeriod);
  }, [currentPeriod]);

  const navigate = useCallback((newPeriod: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(PERIOD_PARAM, newPeriod);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const navigateNext = useCallback(() => {
    let nextPeriod = currentPeriod;
    const year = parseInt(currentPeriod.slice(0, 4));

    switch (currentType) {
      case "year":
        nextPeriod = `${year + 1}`;
        break;
      case "semester":
        const semester = parseInt(currentPeriod.slice(6));
        if (semester === 1) nextPeriod = `${year}-S2`;
        else nextPeriod = `${year + 1}-S1`;
        break;
      case "quarter":
        const quarter = parseInt(currentPeriod.slice(6));
        if (quarter < 4) nextPeriod = `${year}-Q${quarter + 1}`;
        else nextPeriod = `${year + 1}-Q1`;
        break;
      case "month":
      default:
        // Use existing month logic or simple increment
        // Assuming format YYYY-MM from parsePeriodParamExtended fallback
        // But wait, parsePeriodParamExtended might return "novembro-2024" if it falls back to parsePeriodParam
        // Let's standardize to YYYY-MM for calculation if it's a month
        try {
           // This handles "novembro-2024" -> { year: 2024, month: 11 }
           // But parsePeriodParamExtended returns "YYYY-MM" if it's a standard month param?
           // No, parsePeriodParamExtended calls parsePeriodParam which returns "YYYY-MM" (formatPeriod result)
           // So currentPeriod is "YYYY-MM"
           const { year: mYear, month: mMonth } = parsePeriod(currentPeriod);
           if (mMonth === 12) nextPeriod = formatPeriod(mYear + 1, 1);
           else nextPeriod = formatPeriod(mYear, mMonth + 1);
        } catch (e) {
           // Fallback if parsing fails
           const now = new Date();
           nextPeriod = formatPeriod(now.getFullYear(), now.getMonth() + 1);
        }
        break;
    }
    navigate(nextPeriod);
  }, [currentPeriod, currentType, navigate]);

  const navigatePrev = useCallback(() => {
    let prevPeriod = currentPeriod;
    const year = parseInt(currentPeriod.slice(0, 4));

    switch (currentType) {
      case "year":
        prevPeriod = `${year - 1}`;
        break;
      case "semester":
        const semester = parseInt(currentPeriod.slice(6));
        if (semester === 2) prevPeriod = `${year}-S1`;
        else prevPeriod = `${year - 1}-S2`;
        break;
      case "quarter":
        const quarter = parseInt(currentPeriod.slice(6));
        if (quarter > 1) prevPeriod = `${year}-Q${quarter - 1}`;
        else prevPeriod = `${year - 1}-Q4`;
        break;
      case "month":
      default:
        try {
           const { year: mYear, month: mMonth } = parsePeriod(currentPeriod);
           if (mMonth === 1) prevPeriod = formatPeriod(mYear - 1, 12);
           else prevPeriod = formatPeriod(mYear, mMonth - 1);
        } catch (e) {
           const now = new Date();
           prevPeriod = formatPeriod(now.getFullYear(), now.getMonth() + 1);
        }
        break;
    }
    navigate(prevPeriod);
  }, [currentPeriod, currentType, navigate]);

  const changeType = useCallback((type: PeriodType) => {
    // When changing type, try to keep the current year/date context
    const year = parseInt(currentPeriod.slice(0, 4));
    let newPeriod = "";

    switch (type) {
      case "year":
        newPeriod = `${year}`;
        break;
      case "semester":
        newPeriod = `${year}-S1`;
        break;
      case "quarter":
        newPeriod = `${year}-Q1`;
        break;
      case "month":
        newPeriod = formatPeriod(year, 1); // Default to January of that year
        break;
    }
    navigate(newPeriod);
  }, [currentPeriod, navigate]);

  return {
    currentPeriod,
    currentType,
    navigateNext,
    navigatePrev,
    changeType,
  };
}
