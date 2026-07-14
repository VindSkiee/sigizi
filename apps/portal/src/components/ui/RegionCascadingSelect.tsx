"use client";

import { useState, useMemo } from "react";
import { REGIONS, type Region } from "../features/admin/market/regions";

interface RegionCascadingSelectProps {
  onSelect: (params: {
    province?: string;
    regency?: string;
    district?: string;
    village?: string;
  }) => void;
  value?: {
    province?: string;
    regency?: string;
    district?: string;
    village?: string;
  };
  disabled?: boolean;
}

export function RegionCascadingSelect({
  onSelect,
  value,
  disabled,
}: RegionCascadingSelectProps) {
  const [selectedProvince, setSelectedProvince] = useState<string>(
    value?.province ?? "",
  );
  const [selectedRegency, setSelectedRegency] = useState<string>(
    value?.regency ?? "",
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    value?.district ?? "",
  );
  const [selectedVillage, setSelectedVillage] = useState<string>(
    value?.village ?? "",
  );

  const provinceOptions = useMemo(() => REGIONS.map((r) => r.name), []);

  const regencyOptions = useMemo(() => {
    if (!selectedProvince) return [];
    const province = REGIONS.find((r) => r.name === selectedProvince);
    return province?.regencies.map((r) => r.name) ?? [];
  }, [selectedProvince]);

  const districtOptions = useMemo(() => {
    if (!selectedProvince || !selectedRegency) return [];
    const province = REGIONS.find((r) => r.name === selectedProvince);
    const regency = province?.regencies.find((r) => r.name === selectedRegency);
    return regency?.districts ?? [];
  }, [selectedProvince, selectedRegency]);

  function emit(
    province: string,
    regency: string,
    district: string,
    village: string,
  ) {
    const params: {
      province?: string;
      regency?: string;
      district?: string;
      village?: string;
    } = {};
    if (province) params.province = province;
    if (regency) params.regency = regency;
    if (district) params.district = district;
    if (village) params.village = village;
    onSelect(params);
  }

  function handleProvinceChange(val: string) {
    setSelectedProvince(val);
    setSelectedRegency("");
    setSelectedDistrict("");
    setSelectedVillage("");
    emit(val, "", "", "");
  }

  function handleRegencyChange(val: string) {
    setSelectedRegency(val);
    setSelectedDistrict("");
    setSelectedVillage("");
    emit(selectedProvince, val, "", "");
  }

  function handleDistrictChange(val: string) {
    setSelectedDistrict(val);
    setSelectedVillage("");
    emit(selectedProvince, selectedRegency, val, "");
  }

  function handleVillageChange(val: string) {
    setSelectedVillage(val);
    emit(selectedProvince, selectedRegency, selectedDistrict, val);
  }

  const selectClass =
    "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition-colors";

  return (
    <div className="space-y-3">
      {/* Province */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
          Provinsi
        </label>
        <select
          value={selectedProvince}
          onChange={(e) => handleProvinceChange(e.target.value)}
          disabled={disabled}
          className={selectClass}
        >
          <option value="">Pilih Provinsi</option>
          {provinceOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Regency */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
          Kabupaten / Kota
        </label>
        <select
          value={selectedRegency}
          onChange={(e) => handleRegencyChange(e.target.value)}
          disabled={disabled || !selectedProvince}
          className={selectClass}
        >
          <option value="">Pilih Kabupaten/Kota</option>
          {regencyOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
          Kecamatan
        </label>
        <select
          value={selectedDistrict}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={disabled || !selectedRegency}
          className={selectClass}
        >
          <option value="">Pilih Kecamatan (opsional)</option>
          {districtOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Village */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
          Kelurahan / Desa
        </label>
        <input
          type="text"
          value={selectedVillage}
          onChange={(e) => handleVillageChange(e.target.value)}
          placeholder="Ketik nama kelurahan/desa (opsional)"
          disabled={disabled}
          className={selectClass}
        />
        <p className="text-xs text-gray-400 mt-1">
          Isi untuk pencarian lebih spesifik ke tingkat kelurahan/desa
        </p>
      </div>
    </div>
  );
}
