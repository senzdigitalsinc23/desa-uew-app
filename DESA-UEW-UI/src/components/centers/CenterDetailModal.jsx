import React, { useState, useEffect, useMemo } from 'react';
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
import { getPublicCentersData } from '../../data/unifiedDirectory';
import { fetchPrograms, fetchCenterCoordinators, fetchCenterHotels, fetchCenterHealth, fetchCenterRestaurants } from '../../services/api';

export default function CenterDetailModal({ center, regionName, onClose }) {
  const [activeTab, setActiveTab] = useState('coordinator');
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coordinators, setCoordinators] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [health, setHealth] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const isApiMode = import.meta.env.VITE_DATA_SOURCE === 'api_access';

  useEffect(() => {
    if (!center?.id) { setPrograms([]); return; }
    let cancelled = false;
    setLoading(true);
    Promise.all([getPublicCentersData(), fetchPrograms()]).then(([regions, allPrograms]) => {
      if (cancelled) return;
      const progMap = {};
      for (const prog of (allPrograms || [])) {
        progMap[String(prog.id)] = prog;
      }
      const matched = [];
      for (const region of (regions || [])) {
        for (const prog of (region.programs || [])) {
          const fullProg = progMap[String(prog.id)];
          if (fullProg && (fullProg.available_centers || []).some((c) => String(c.id) === String(center.id))) {
            matched.push({ ...prog, regionName: region.name });
          }
        }
      }
      setPrograms(matched);

      // Load linked amenities from API for API mode
      if (isApiMode && center.id) {
        const id = String(center.id);
        Promise.allSettled([
          fetchCenterCoordinators(id),
          fetchCenterHotels(id),
          fetchCenterHealth(id),
          fetchCenterRestaurants(id),
        ]).then(([coordRes, hotelRes, healthRes, restRes]) => {
          if (cancelled) return;
          setCoordinators(coordRes.status === 'fulfilled' ? (coordRes.value || []) : []);
          setHotels(hotelRes.status === 'fulfilled' ? (hotelRes.value || []) : []);
          setHealth(healthRes.status === 'fulfilled' ? (healthRes.value || []) : []);
          setRestaurants(restRes.status === 'fulfilled' ? (restRes.value || []) : []);
        });
      }
      setLoading(false);
    }).catch(() => { setPrograms([]); setLoading(false); });
    return () => { cancelled = true; };
  }, [center?.id]);

  const resolvedCoordinator = coordinators.length > 0 ? coordinators[0] : center.coordinator;
  const resolvedCoordinators = coordinators.length > 0 ? coordinators : (center.coordinators || []);
  const resolvedHotels = hotels.length > 0 ? hotels : (center.nearbyHotels || []);
  const resolvedHealth = health.length > 0 ? health : (center.nearbyHealth || []);
  const resolvedRestaurants = restaurants.length > 0 ? restaurants : (center.nearbyRestaurants || []);

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
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-3 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('coordinator')}
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'coordinator'
                  ? 'border-uew-red text-uew-red bg-white'
                  : 'border-transparent text-slate-600 hover:text-uew-navy'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Coordinator Details ({resolvedCoordinators.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('programs')}
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
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
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'hotels'
                  ? 'border-uew-red text-uew-red bg-white'
                  : 'border-transparent text-slate-600 hover:text-uew-navy'
              }`}
            >
              <Hotel className="w-4 h-4" />
              <span>Nearby Hotels ({resolvedHotels.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('health')}
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'health'
                  ? 'border-uew-red text-uew-red bg-white'
                  : 'border-transparent text-slate-600 hover:text-uew-navy'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Health Facilities ({resolvedHealth.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('restaurants')}
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'restaurants'
                  ? 'border-uew-red text-uew-red bg-white'
                  : 'border-transparent text-slate-600 hover:text-uew-navy'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Restaurants ({resolvedRestaurants.length})</span>
            </button>
          </div>

          {/* Modal Body / Tab Content */}
          <div className="p-5 md:p-6 overflow-y-auto flex-1 text-slate-700">
            {/* TAB 1: COORDINATOR */}
            {activeTab === 'coordinator' && resolvedCoordinator && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-uew-red">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base md:text-lg font-bold text-uew-navy">
                        {resolvedCoordinator.full_name || resolvedCoordinator.name}
                      </h4>
                      <p className="text-xs font-semibold text-uew-red uppercase tracking-wider">
                        {resolvedCoordinator.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Official Centre Representative for Distance Education Students Association (DESA)
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={`tel:${resolvedCoordinator.phone}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-uew-red hover:shadow-xs transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone / WhatsApp</span>
                        <span className="text-xs font-bold text-slate-800">{resolvedCoordinator.phone}</span>
                      </div>
                    </a>

                    <a
                      href={`mailto:${resolvedCoordinator.email}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-uew-red hover:shadow-xs transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Official Email</span>
                        <span className="text-xs font-bold text-slate-800 truncate block max-w-[180px]">{resolvedCoordinator.email}</span>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Multiple coordinators list */}
                {resolvedCoordinators.length > 1 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Additional Coordinators</p>
                    <div className="space-y-2">
                      {resolvedCoordinators.slice(1).map((co, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-100 text-slate-500"><User className="w-4 h-4" /></div>
                          <div>
                            <p className="text-sm font-bold text-uew-navy">{co.full_name || co.name}</p>
                            <p className="text-[11px] text-slate-500">{co.title} · {co.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Consultation Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <Building2 className="w-3.5 h-3.5 text-uew-navy" />
                      <span>Coordinator Office Location</span>
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-slate-800">
                      {resolvedCoordinator.office}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <Clock className="w-3.5 h-3.5 text-uew-navy" />
                      <span>Consultation Hours</span>
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-slate-800">
                      {resolvedCoordinator.office_hours || resolvedCoordinator.hours}
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

                {resolvedHotels.length > 0 ? (
                  resolvedHotels.map((hotel, idx) => (
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
                            {hotel.distance || hotel.distance_range || 'Nearby'}
                          </span>
                          {hotel.rate_range && (
                            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              Est. {hotel.rate_range}
                            </span>
                          )}
                        </div>
                      </div>

                      {hotel.phone && (
                        <a
                          href={`tel:${hotel.phone}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-uew-red text-xs font-bold transition-colors border border-slate-200"
                        >
                          <Phone className="w-3.5 h-3.5 text-uew-red" />
                          <span>Call {hotel.phone}</span>
                        </a>
                      )}
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

                {resolvedHealth.length > 0 ? (
                  resolvedHealth.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-uew-red/40 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <h5 className="text-sm md:text-base font-bold text-uew-navy">
                          {h.name}
                        </h5>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {h.type && (
                            <span className="px-2 py-0.5 rounded-md bg-red-50 text-uew-red font-bold border border-red-200 text-[10px]">
                              {h.type}
                            </span>
                          )}
                          <span className="text-slate-500 flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-slate-400" />
                            {h.distance || 'Nearby'}
                          </span>
                          {h.is_24_7 && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                              24/7
                            </span>
                          )}
                        </div>
                        {h.hours && <p className="text-[11px] text-slate-400">Hours: {h.hours}</p>}
                      </div>

                      {h.phone && (
                        <a
                          href={`tel:${h.phone}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-uew-red text-uew-red hover:text-white text-xs font-bold transition-colors border border-red-200"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Emergency: {h.phone}</span>
                        </a>
                      )}
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

                {resolvedRestaurants.length > 0 ? (
                  resolvedRestaurants.map((food, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-uew-red/40 hover:shadow-sm transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm md:text-base font-bold text-uew-navy">
                          {food.name}
                        </h5>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {food.distance || 'Nearby'}
                        </span>
                      </div>

                      {food.specialty && (
                        <p className="text-xs text-slate-600 font-medium">
                          <strong className="text-uew-navy">Specialties:</strong> {food.specialty}
                        </p>
                      )}
                      {food.cuisine_type && (
                        <p className="text-xs text-slate-600 font-medium">
                          <strong className="text-uew-navy">Cuisine:</strong> {food.cuisine_type}
                        </p>
                      )}
                      {food.price_range && (
                        <p className="text-xs text-slate-600 font-medium">
                          <strong className="text-uew-navy">Price Range:</strong> {food.price_range}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Operating Hours: {food.open_hours || food.openHours || 'Varies'}</span>
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
