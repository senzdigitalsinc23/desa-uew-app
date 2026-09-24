import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  Building2,
  User,
  Hotel,
  Activity,
  Utensils,
  Search,
  Sparkles,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { getCentersData } from '../../data/persistence';
import CenterDetailModal from './CenterDetailModal';

export default function CentersExplorer() {
  // Navigation State: 'regions' | 'programs' | 'centers'
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [activeCenterModal, setActiveCenterModal] = useState(null);
  const [explorerSearch, setExplorerSearch] = useState('');
  const [regions, setRegions] = useState(getCentersData);

  useEffect(() => {
    const handler = () => setRegions(getCentersData);
    window.addEventListener('desa-data-changed', handler);
    return () => window.removeEventListener('desa-data-changed', handler);
  }, []);

  // 1. Filtered Regions (Level 1)
  const filteredRegions = useMemo(() => {
    if (!explorerSearch.trim()) return regions;
    const q = explorerSearch.toLowerCase();
    return regions.filter(r => 
      r.name.toLowerCase().includes(q) ||
      r.shortName.toLowerCase().includes(q) ||
      r.capital.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q)
    );
  }, [explorerSearch]);

  // 2. Programs for Selected Region (Level 2)
  const availablePrograms = useMemo(() => {
    if (!selectedRegion) return [];
    if (!explorerSearch.trim()) return selectedRegion.programs;
    const q = explorerSearch.toLowerCase();
    return selectedRegion.programs.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.level.toLowerCase().includes(q)
    );
  }, [selectedRegion, explorerSearch]);

  // 3. Centers for Selected Program in Selected Region (Level 3)
  const centersForProgram = useMemo(() => {
    if (!selectedRegion || !selectedProgram) return [];
    
    // Find centers in this region whose ID is in selectedProgram.centerIds
    const matchingCenters = selectedRegion.centers.filter(c => 
      selectedProgram.centerIds.includes(c.id)
    );

    if (!explorerSearch.trim()) return matchingCenters;
    const q = explorerSearch.toLowerCase();
    return matchingCenters.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.premises.toLowerCase().includes(q) ||
      c.coordinator?.name.toLowerCase().includes(q)
    );
  }, [selectedRegion, selectedProgram, explorerSearch]);

  // Navigation handlers
  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    setSelectedProgram(null);
    setExplorerSearch('');
  };

  const handleSelectProgram = (program) => {
    setSelectedProgram(program);
    setExplorerSearch('');
  };

  const handleResetToRegions = () => {
    setSelectedRegion(null);
    setSelectedProgram(null);
    setExplorerSearch('');
  };

  const handleBackToPrograms = () => {
    setSelectedProgram(null);
    setExplorerSearch('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-4">
      {/* BREADCRUMB NAVIGATION & SEARCH */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Breadcrumb Steps */}
          <nav className="flex items-center flex-wrap gap-1.5 text-xs md:text-sm font-semibold text-slate-500">
            <button
              onClick={handleResetToRegions}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                !selectedRegion
                  ? 'bg-uew-navy text-white font-bold'
                  : 'hover:bg-slate-100 text-slate-700 hover:text-uew-navy'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>All 16 Regions</span>
            </button>

            {selectedRegion && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <button
                  onClick={handleBackToPrograms}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedRegion && !selectedProgram
                      ? 'bg-uew-red text-white font-bold'
                      : 'hover:bg-slate-100 text-slate-700 hover:text-uew-red'
                  }`}
                >
                  <span>{selectedRegion.shortName}</span>
                </button>
              </>
            )}

            {selectedProgram && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-uew-navy font-bold line-clamp-1 max-w-[200px] sm:max-w-xs">
                  {selectedProgram.title}
                </span>
              </>
            )}
          </nav>

          {/* Quick Filter Input */}
          <div className="relative w-full mt-3 md:mt-0 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={explorerSearch}
              onChange={(e) => setExplorerSearch(e.target.value)}
              placeholder={
                !selectedRegion
                  ? 'Filter regions...'
                  : !selectedProgram
                  ? 'Filter programs...'
                  : 'Filter centers...'
              }
              className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red"
            />
          </div>
        </div>

        {/* Informative Subheading */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="min-w-0 flex-1">
            {!selectedRegion ? (
              <span className="truncate">Step 1: Select a Region</span>
            ) : !selectedProgram ? (
              <span className="truncate">Step 2: Select a Program</span>
            ) : (
              <span className="truncate">Step 3: View Center Details</span>
            )}
          </div>

          {selectedRegion && (
            <button
              onClick={selectedProgram ? handleBackToPrograms : handleResetToRegions}
              className="inline-flex items-center gap-1 text-uew-red font-bold hover:underline shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Back to {selectedProgram ? 'Programs' : 'Regions'}</span>
              <span className="xs:hidden">Back</span>
            </button>
          )}
        </div>
      </div>

      {/* LEVEL 1: ALL 16 REGIONS GRID */}
      {!selectedRegion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredRegions.map((region) => (
            <button
              key={region.id}
              onClick={() => handleSelectRegion(region)}
              className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-uew-red/60 hover:shadow-md transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-red-50 text-uew-red text-[10px] font-extrabold border border-red-200 uppercase tracking-wider">
                    {region.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {region.centers.length} {region.centers.length === 1 ? 'Center' : 'Centers'}
                  </span>
                </div>

                <h4 className="text-base font-bold text-uew-navy group-hover:text-uew-red transition-colors">
                  {region.name}
                </h4>

                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Regional Capital: <strong className="text-slate-700">{region.capital}</strong>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-uew-red">
                <span>{region.programs.length} Programs Available</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-uew-red" />
              </div>
            </button>
          ))}
        </motion.div>
      )}

      {/* LEVEL 2: PROGRAMS IN SELECTED REGION */}
      {selectedRegion && !selectedProgram && (
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-3"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-uew-navy">
              Programs Offered in {selectedRegion.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your academic program to discover all active distance learning centers in this region:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePrograms.map((program) => (
              <button
                key={program.id}
                onClick={() => handleSelectProgram(program)}
                className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-uew-red/60 hover:shadow-md transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                      {program.level}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {program.centerIds.length} {program.centerIds.length === 1 ? 'Study Center' : 'Study Centers'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-uew-navy group-hover:text-uew-red transition-colors">
                    {program.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-uew-red" />
                    <span>{program.department}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-uew-navy group-hover:text-uew-red">
                  <span>View Centers in {selectedRegion.shortName}</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-uew-red" />
                </div>
              </button>
            ))}
          </div>

          {availablePrograms.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              <p className="text-sm font-semibold">No programs matched your search filter.</p>
              <button
                onClick={() => setExplorerSearch('')}
                className="mt-2 text-xs font-bold text-uew-red hover:underline"
              >
                Clear filter
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* LEVEL 3: STUDY CENTERS FOR SELECTED PROGRAM */}
      {selectedRegion && selectedProgram && (
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-2xl bg-gradient-to-r from-uew-navy via-[#1E2F4D] to-uew-navy text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-uew-redSoft">
                Offering in {selectedRegion.name}
              </span>
              <h3 className="text-base md:text-lg font-bold">
                {selectedProgram.title}
              </h3>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-white whitespace-nowrap">
              <Building2 className="w-4 h-4 text-uew-red" />
              <span>{centersForProgram.length} Available Centers</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {centersForProgram.map((center) => (
              <div
                key={center.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-uew-red hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-uew-red border border-red-200 text-[10px] font-bold">
                      {center.city}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Weekend Tutorials
                    </span>
                  </div>

                  <h4 className="text-base md:text-lg font-bold text-uew-navy">
                    {center.name}
                  </h4>

                  <p className="text-xs text-slate-600 mt-1.5 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-uew-red shrink-0 mt-0.5" />
                    <span>{center.premises}</span>
                  </p>

                  {/* Coordinator Preview */}
                  {center.coordinator && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs">
                      <div className="w-7 h-7 rounded-full bg-uew-navy text-white flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-800 block truncate">{center.coordinator.name}</span>
                        <span className="text-[10px] text-slate-500 block">{center.coordinator.phone}</span>
                      </div>
                    </div>
                  )}

                  {/* Amenities Quick Counts */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Hotel className="w-3.5 h-3.5 text-slate-400" />
                      {center.nearbyHotels?.length || 0} Hotels
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      {center.nearbyHealth?.length || 0} Clinics
                    </span>
                    <span className="flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5 text-slate-400" />
                      {center.nearbyRestaurants?.length || 0} Eateries
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => setActiveCenterModal(center)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-uew-navy hover:bg-uew-red text-white text-xs md:text-sm font-bold transition-colors shadow-xs active:scale-95"
                  >
                    <span>View Center Details, Hotels & Support</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {centersForProgram.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              <p className="text-sm font-semibold">No centers found matching your query in this region.</p>
              <button
                onClick={() => setExplorerSearch('')}
                className="mt-2 text-xs font-bold text-uew-red hover:underline"
              >
                Clear filter
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* FULL CENTER PROFILE MODAL */}
      {activeCenterModal && (
        <CenterDetailModal
          center={activeCenterModal}
          regionName={selectedRegion?.name}
          onClose={() => setActiveCenterModal(null)}
        />
      )}
    </div>
  );
}
