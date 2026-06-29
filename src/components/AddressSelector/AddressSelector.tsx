import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import locationApi, { LocationUnit } from "src/apis/location.api";

interface Props {
  onChange: (value: { province: string; district: string; ward: string }) => void;
}

const selectClass =
  "w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-primary";

export default function AddressSelector({ onChange }: Props) {
  const { t } = useTranslation();
  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<number | null>(null);

  const { data: provincesData } = useQuery({
    queryKey: ["provinces"],
    queryFn: () => locationApi.getProvinces(),
    staleTime: Infinity,
  });
  const provinces: LocationUnit[] = provincesData?.data || [];

  const { data: districtsData } = useQuery({
    queryKey: ["districts", provinceCode],
    queryFn: () => locationApi.getDistricts(provinceCode as number),
    enabled: Boolean(provinceCode),
    staleTime: Infinity,
  });
  const districts: LocationUnit[] = districtsData?.data.districts || [];

  const { data: wardsData } = useQuery({
    queryKey: ["wards", districtCode],
    queryFn: () => locationApi.getWards(districtCode as number),
    enabled: Boolean(districtCode),
    staleTime: Infinity,
  });
  const wards: LocationUnit[] = wardsData?.data.wards || [];

  const nameOf = (list: LocationUnit[], code: number) => list.find((x) => x.code === code)?.name || "";

  const handleProvince = (code: number) => {
    setProvinceCode(code || null);
    setDistrictCode(null);
    onChange({ province: code ? nameOf(provinces, code) : "", district: "", ward: "" });
  };

  const handleDistrict = (code: number) => {
    setDistrictCode(code || null);
    onChange({
      province: provinceCode ? nameOf(provinces, provinceCode) : "",
      district: code ? nameOf(districts, code) : "",
      ward: "",
    });
  };

  const handleWard = (code: number) => {
    onChange({
      province: provinceCode ? nameOf(provinces, provinceCode) : "",
      district: districtCode ? nameOf(districts, districtCode) : "",
      ward: code ? nameOf(wards, code) : "",
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <select className={selectClass} value={provinceCode || ""} onChange={(e) => handleProvince(Number(e.target.value))}>
        <option value="">{t("Tỉnh / Thành phố")}</option>
        {provinces.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        value={districtCode || ""}
        onChange={(e) => handleDistrict(Number(e.target.value))}
        disabled={!provinceCode}
      >
        <option value="">{t("Quận / Huyện")}</option>
        {districts.map((d) => (
          <option key={d.code} value={d.code}>
            {d.name}
          </option>
        ))}
      </select>

      <select
        className={selectClass}
        onChange={(e) => handleWard(Number(e.target.value))}
        disabled={!districtCode}
        defaultValue=""
      >
        <option value="">{t("Phường / Xã")}</option>
        {wards.map((w) => (
          <option key={w.code} value={w.code}>
            {w.name}
          </option>
        ))}
      </select>
    </div>
  );
}
