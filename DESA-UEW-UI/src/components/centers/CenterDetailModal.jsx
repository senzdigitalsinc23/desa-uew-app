import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  User,
  Phone,
  Mail,
  Clock,
  Hotel,
  Activity,
  Utensils,
  Calendar,
  Building2,
  Navigation,
  ShieldAlert,
  Star,
  GraduationCap,
} from 'lucide-react';
import { getPublicCentersData } from '../../data/persistence';

export default function CenterDetailModal({ center, regionName, onClose }) {
  const [activeTab, setActiveTab] = useState('coordinator');

  const programs = useMemo(() => {
    if (!center?.id) return [];
    const regions = getPublicCentersData();
    const matched = [];
    regions.forEach((region) => {
      region.programs?.forEach((prog) => {
        if (prog.centerIds?.includes(center.id)) {
          matched.push({ ...prog, regionName: region.name });
        }
      });
    });
    return matched;
  }, [center?.id]);

  if (!center) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-uew-navyDark/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="p-5 md:p-6 bg-gradient-to-r from-uew-navy via-[#1E2F4D] to-uew-navy text-white relative border-b-2 border-uew-red">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-uew-red text-white">
                Study Center Profile
              </span>
              {regionName && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/15 text-slate-200">
                  {regionName}
                </span>
              )}
            </div>

            <h3 className="text-lg md:text-2xl font-extrabold leading-snug">
              {center.name}
            </h3>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs md:text-sm text-slate-300 mt-2">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-uew-red" />
                <span>{center.premises}</span>
              </div>
              {center.landmark && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{center.landmark}</span>
                </div>
              )}
            </div>

            {center.schedule && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-xs font-semibold text-slate-200">
                <Calendar className="w-3.5 h-3.5 text-uew-red" />
                <span>Tutorial Schedule: {center.schedule}</span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('coordinator')}
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'coordinator'
                  ? 'border-uew-red text-uew-red bg-white'
                  : 'border-transparent text-slate-600 hover:text-uew-navy'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Coordinator Details</span>
            </button>

            <button
              onClick={() => setActiveTab('programs')}
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'programs'
                  ? 'border-uew-red text-uew-red bg-white'
                  : 'border-transparent text-slate-600 hover:text-uew-navy'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Programs ({programs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'hotels'
                  ? 'border-uew-red text-uew-red bg-white'
                  : 'border-transparent text-slate-600 hover:text-uew-navy'
              }`}
            >
              <Hotel className="w-4 h-4" />
              <span>Nearby Hotels ({center.nearbyHotels?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('health')}
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'health'
                  ? 'border-uew-red text-uew-red bg-white'
                  : 'border-transparent text-slate-600 hover:text-uew-navy'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Health Facilities ({center.nearbyHealth?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('restaurants')}
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'restaurants'
                  ? 'border-uew-red text-uew-red bg-white'
                  : 'border-transparent text-slate-600 hover:text-uew-navy'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Restaurants ({center.nearbyRestaurants?.length || 0})</span>
            </button>
          </div>

          {/* Modal Body / Tab Content */}
          <div className="p-5 md:p-6 overflow-y-auto flex-1 text-slate-700">
            {/* TAB 1: COORDINATOR */}
            {activeTab === 'coordinator' && center.coordinator && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-uew-red">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base md:text-lg font-bold text-uew-navy">
                        {center.coordinator.name}
                      </h4>
                      <p className="text-xs font-semibold text-uew-red uppercase tracking-wider">
                        {center.coordinator.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Official Centre Representative for Distance Education Students Association (DESA)
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={`tel:${center.coordinator.phone}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-uew-red hover:shadow-xs transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone / WhatsApp</span>
                        <span className="text-xs font-bold text-slate-800">{center.coordinator.phone}</span>
                      </div>
                    </a>

                    <a
                      href={`mailto:${center.coordinator.email}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-uew-red hover:shadow-xs transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Email</span>
                        <span className="text-xs font-bold text-slate-800 truncate block max-w-[180px]">{center.coordinator.email}</span>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Consultation Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <Building2 className="w-3.5 h-3.5 text-uew-navy" />
                      <span>Coordinator Office Location</span>
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-slate-800">
                      {center.coordinator.office}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <Clock className="w-3.5 h-3.5 text-uew-navy" />
                      <span>Consultation Hours</span>
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-slate-800">
                      {center.coordinator.hours}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROGRAMS */}
            {activeTab === 'programs' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Academic programs offered at {center.name}:
                </p>
                {programs.length > 0 ? (
                  programs.map((prog, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-uew-red/40 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h5 className="text-sm md:text-base font-bold text-uew-navy">
                            {prog.title}
                          </h5>
                          <p className="text-xs text-slate-500">{prog.department}</p>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md mt-1">
                            <GraduationCap className="w-3 h-3 text-uew-red" />
                            {prog.level}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 shrink-0">
                          {prog.regionName}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No programs recorded for this center yet.</p>
                )}
              </div>
            )}

            {/* TAB 2: HOTELS & GUEST HOUSES */}
            {activeTab === 'hotels' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Verified guest houses and hotels near {center.name} suitable for weekend tutorial stays and examination periods:
                </p>

                {center.nearbyHotels && center.nearbyHotels.length > 0 ? (
                  center.nearbyHotels.map((hotel, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-uew-red/40 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm md:text-base font-bold text-uew-navy">
                            {hotel.name}
                          </h5>
                          {hotel.rating && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              {hotel.rating}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Navigation className="w-3.5 h-3.5 text-uew-red" />
                            {hotel.distance}
                          </span>
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            Est. {hotel.rate}
                          </span>
                        </div>
                      </div>

                      <a
                        href={`tel:${hotel.phone}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-uew-red text-xs font-bold transition-colors border border-slate-200"
                      >
                        <Phone className="w-3.5 h-3.5 text-uew-red" />
                        <span>Call {hotel.phone}</span>
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No hotel listings recorded for this center yet.</p>
                )}
              </div>
            )}

            {/* TAB 3: HEALTH FACILITIES */}
            {activeTab === 'health' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Nearby medical centers, clinics, and emergency health services around the study center:
                </p>

                {center.nearbyHealth && center.nearbyHealth.length > 0 ? (
                  center.nearbyHealth.map((health, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-uew-red/40 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <h5 className="text-sm md:text-base font-bold text-uew-navy">
                          {health.name}
                        </h5>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded-md bg-red-50 text-uew-red font-bold border border-red-200 text-[10px]">
                            {health.type}
                          </span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-slate-400" />
                            {health.distance}
                          </span>
                        </div>
                      </div>

                      <a
                        href={`tel:${health.phone}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-uew-red text-uew-red hover:text-white text-xs font-bold transition-colors border border-red-200"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Emergency: {health.phone}</span>
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No health facility listings recorded yet.</p>
                )}
              </div>
            )}

            {/* TAB 4: RESTAURANTS & EATERIES */}
            {activeTab === 'restaurants' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Recommended food spots, cafeterias, and chop bars for students during weekend lectures:
                </p>

                {center.nearbyRestaurants && center.nearbyRestaurants.length > 0 ? (
                  center.nearbyRestaurants.map((food, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-uew-red/40 hover:shadow-sm transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm md:text-base font-bold text-uew-navy">
                          {food.name}
                        </h5>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {food.distance}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium">
                        <strong className="text-uew-navy">Specialties:</strong> {food.specialty}
                      </p>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Operating Hours: {food.openHours}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No restaurant listings recorded yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              UEW Distance Education Center Directory
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-uew-navy hover:bg-uew-red text-white text-xs font-bold transition-colors shadow-xs"
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
