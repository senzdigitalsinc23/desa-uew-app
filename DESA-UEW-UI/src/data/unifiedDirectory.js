import { getPublicMockData, getPublicCentersData, getPublicAnnouncements } from './persistence';

/**
  Builds and returns the comprehensive system directory combining all data sources.
  Only PUBLIC items are included.
  */
export function getUnifiedDirectory() {
  const directory = [];

  // 1. Study Centers & Regional Directorates (public only)
  const centersData = getPublicCentersData();
  centersData.forEach((region) => {
    if (!region.centers || region.centers.length === 0) return;

    // Region entry
    directory.push({
      id: `region-${region.id}`,
      systemType: 'region',
      category: 'Study Centers',
      title: `${region.name} Study Center Directorate`,
      region: region.name,
      regionShort: region.shortName,
      capital: region.capital,
      description: `${region.description} Regional Directorate in ${region.capital}. Coordinating ${region.centers.length} distance study centers.`,
      centersCount: region.centers.length,
      programs: region.programs?.map((p) => p.title) || [],
      tags: [
        'region', 'directorate', 'study centers',
        region.name.toLowerCase(), region.shortName.toLowerCase(),
        region.capital.toLowerCase(), region.code.toLowerCase(),
        ...(region.programs?.map((p) => p.title.toLowerCase()) || []),
      ],
      rawItem: region,
    });

    // Each study center
    region.centers.forEach((center) => {
      const hotelNames = center.nearbyHotels?.map((h) => h.name) || [];
      const healthNames = center.nearbyHealth?.map((h) => h.name) || [];
      const foodNames = center.nearbyRestaurants?.map((r) => r.name) || [];
      const associatedPrograms =
        region.programs
          ?.filter((p) => p.centerIds?.includes(center.id))
          ?.map((p) => p.title) || [];

      directory.push({
        id: center.id,
        systemType: 'center',
        category: 'Study Centers',
        title: center.name,
        region: region.name,
        regionShort: region.shortName,
        city: center.city,
        premises: center.premises,
        landmark: center.landmark,
        schedule: center.schedule,
        coordinator: center.coordinator,
        coordinatorName: center.coordinator?.name || 'Study Center Coordinator',
        coordinatorPhone: center.coordinator?.phone || '',
        coordinatorEmail: center.coordinator?.email || '',
        coordinatorOffice: center.coordinator?.office || '',
        description: `${center.premises}, ${center.city}. Landmark: ${center.landmark}. Schedule: ${center.schedule}. Coordinator: ${center.coordinator?.name} (${center.coordinator?.phone}).`,
        programs: associatedPrograms,
        nearbyHotels: center.nearbyHotels || [],
        nearbyHealth: center.nearbyHealth || [],
        nearbyRestaurants: center.nearbyRestaurants || [],
        tags: [
          'center', 'study center', 'coordinator', 'campus', 'distance center',
          'hotel', 'accommodation', 'guest house',
          'health', 'clinic', 'hospital', 'medical',
          'restaurant', 'eatery', 'food', 'dining',
          center.name.toLowerCase(), region.name.toLowerCase(),
          region.shortName.toLowerCase(), center.city.toLowerCase(),
          center.premises.toLowerCase(), center.landmark.toLowerCase(),
          center.coordinator?.name?.toLowerCase() || '',
          center.coordinator?.phone || '',
          center.coordinator?.email?.toLowerCase() || '',
          ...hotelNames.map((h) => h.toLowerCase()),
          ...healthNames.map((h) => h.toLowerCase()),
          ...foodNames.map((f) => f.toLowerCase()),
          ...associatedPrograms.map((p) => p.toLowerCase()),
        ].filter(Boolean),
        rawItem: { ...center, regionName: region.name },
      });
    });
  });

  // 2. Announcements (public only)
  const announcementsData = getPublicAnnouncements();
  announcementsData.announcements.forEach((ann) => {
    directory.push({
      id: `ann-${ann.id}`,
      systemType: 'announcement',
      category: 'Announcement Hub',
      title: ann.title,
      date: ann.date,
      thumbnail: ann.thumbnail,
      excerpt: ann.excerpt,
      description: ann.body || ann.excerpt || '',
      tags: [
        'announcement', 'news', 'notice', 'official',
        'uew notice', 'distance learners', ann.title.toLowerCase(),
      ],
      rawItem: ann,
    });
  });

  // 3. Events (public only)
  if (announcementsData.events) {
    announcementsData.events.forEach((evt) => {
      directory.push({
        id: `evt-${evt.id}`,
        systemType: 'event',
        category: 'DESA Hub',
        title: evt.title,
        date: evt.date,
        location: evt.location || 'UEW Main Campus, Winneba',
        thumbnail: evt.thumbnail,
        excerpt: evt.excerpt,
        description: `${evt.body || evt.excerpt || ''} Venue: ${evt.location || 'UEW Campus'}.`,
        tags: [
          'event', 'activities', 'calendar', 'congress', 'gala',
          'quiz', 'symposium',
          (evt.location || '').toLowerCase(), evt.title.toLowerCase(),
        ].filter(Boolean),
        rawItem: evt,
      });
    });
  }

  // 4. Mock/Academic items (public only) — populated as new tabs are defined
  const mockData = getPublicMockData();
  mockData.forEach((item) => {
    const cat = item.category || 'DESA Hub';
    directory.push({
      id: item.id,
      systemType: 'academic',
      category: cat,
      title: item.title,
      program: item.program || '',
      level: item.level || '',
      description: item.description || '',
      date: item.date || '2025/2026 Academic Year',
      fileSize: item.fileSize || 'PDF Document',
      fileType: item.fileType || 'PDF Document',
      downloadUrl: item.downloadUrl || '#',
      tags: Array.isArray(item.tags) ? item.tags : [],
      rawItem: item,
    });
  });

  return directory;
}

/**
  Searches the directory using multi-token matching across all fields
  */
export function searchDirectory(items, query = '', category = 'All') {
  const cleanQuery = (query || '').trim().toLowerCase();
  const queryTokens = cleanQuery ? cleanQuery.split(/\s+/).filter(Boolean) : [];

  return items.filter((item) => {
    if (category !== 'All') {
      if (item.category?.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
    }
    if (queryTokens.length === 0) return true;

    const searchableText = [
      item.title, item.description, item.category,
      item.program, item.level, item.region, item.regionShort,
      item.capital, item.city, item.premises, item.landmark,
      item.coordinatorName, item.coordinatorPhone, item.coordinatorEmail,
      item.coordinatorOffice, item.location, item.schedule, item.date,
      ...(item.programs || []), ...(item.tags || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return queryTokens.every((token) => searchableText.includes(token));
  });
}
