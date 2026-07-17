"use client";

import { useState, useMemo, useEffect } from "react";
import { REGIONS, type Region } from "../features/admin/market/regions";
import { MapPin } from "lucide-react"; // Tambahkan icon dari lucide-react

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

  // State untuk mengecek mode demo
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    setIsDemoMode(process.env.NEXT_PUBLIC_DEMO_MODE === "true");
  }, []);

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
    "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition-colors";

  return (
    <div className="space-y-4">
      {/* 
        Info Card Mode Demo 
        Hanya dirender jika isDemoMode === true 
      */}
      {isDemoMode && (
        <div className="mb-2 px-5 py-4 bg-blue-50/50 border border-blue-400 rounded-xl flex flex-col items-center text-center">
          <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-2.5 shadow-sm">
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-blue-600 mb-1">
            Perhatian Simulasi!
          </h3>
          <p className="text-[13px] text-gray-500 leading-relaxed max-w-[480px]">
            Data saat ini hanya tersedia di <span className="font-medium text-gray-700">Jawa Barat</span> (Kab/Kota Cirebon). Anda tidak perlu mengisi kecamatan & kelurahan, <span className="font-medium text-gray-700"> pencarian GPS dapat digunakan jika anda berada di area Cirebon</span>.
          </p>
        </div>
      )}

      {/* Province */}
      <div>
        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
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
        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
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
        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
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
        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
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
        <p className="text-[11px] text-gray-400 mt-1.5">
          Isi untuk pencarian lebih spesifik ke tingkat kelurahan/desa
        </p>
      </div>
    </div>
  );
}