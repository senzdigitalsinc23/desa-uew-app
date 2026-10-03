import { fetchRegions, fetchStudyCenters, fetchStudyCenter, fetchPrograms, fetchAnnouncements, fetchEvents, fetchAcademics, fetchOpportunities, fetchSearch, fetchHubAbout, fetchHubLeadership, fetchHubConstitution, fetchHubArchives, fetchHubAssets, fetchHubCommittees, fetchHubGallery } from '../services/api.js';
import { getPublicMockData as getPublicMockDataLocal } from './persistence.js';

/**
 * Returns unified directory data from API or falls back to local JSON.
 * All searchable fields are indexed into tags for robust keyword matching.
 */
export async function getUnifiedDirectory() {
  const items = [];

  // Helper to tag items with their display category label
  function dc(item, displayCategory) {
    return { ...item, displayCategory };
  }

  // Load all data sources in parallel
  const [regions, programs, announcements, events, academics, opportunities, hubAbout, hubLeadership, hubConstitution, hubCommittees, hubArchives, hubAssets] = await Promise.all([
    fetchRegions(),
    fetchPrograms(),
    fetchAnnouncements(),
    fetchEvents(),
    fetchAcademics(),
    fetchOpportunities(),
    fetchHubAbout(),
    fetchHubLeadership(),
    fetchHubConstitution(),
    fetchHubCommittees(),
    fetchHubArchives(),
    fetchHubAssets(),
  ]);

  // ── Helper: extract searchable text from any object ───────────────────
  function extractText(obj, keys) {
    return keys.map(k => obj[k]).filter(Boolean).join(' ');
  }

  // ── 1. HUB DATA (About, Leadership, Constitution, Committees) ────────
  if (hubAbout) {
    const about = hubAbout;
    // About page
    items.push({
      id: 'hub-about',
      systemType: 'hub',
      category: 'DESA Hub',
      title: about.title || 'About DESA',
      description: about.content || about.mission || about.vision || '',
      tags: [
        'about', 'desa', 'association', 'distance education', 'student association',
        'mission', 'vision', 'values', 'history', 'founding',
        'representative', 'advocacy', 'welfare', 'academic', 'social',
        'uew', 'distance learner', 'student body', 'organisation', 'governing',
        (about.title || '').toLowerCase(),
        ...(about.subtitle ? [(about.subtitle).toLowerCase()] : []),
        ...(about.mission ? [(about.mission).toLowerCase()] : []),
        ...(about.vision ? [(about.vision).toLowerCase()] : []),
        ...(about.established_year ? [`since ${about.established_year}`] : []),
      ].filter(Boolean),
      rawItem: about,
    });

    // Mission & Vision as separate items for better search granularity
    if (about.mission) {
      items.push({
        id: 'hub-about-mission',
        systemType: 'hub',
        category: 'DESA Hub',
        title: 'DESA Mission Statement',
        description: about.mission,
        tags: [
          'mission', 'goal', 'objective', 'purpose', 'aim',
          'desa', 'distance education', 'students', 'advocacy',
          'representative body', 'academic', 'welfare', 'social',
          (about.mission).toLowerCase(),
        ].filter(Boolean),
        rawItem: { ...about, _section: 'mission' },
      });
    }
    if (about.vision) {
      items.push({
        id: 'hub-about-vision',
        systemType: 'hub',
        category: 'DESA Hub',
        title: 'DESA Vision Statement',
        description: about.vision,
        tags: [
          'vision', 'future', 'aspiration', 'dream', 'goal',
          'desa', 'distance education', 'inclusive', 'thrive',
          'education community', 'student', 'representation',
          (about.vision).toLowerCase(),
        ].filter(Boolean),
        rawItem: { ...about, _section: 'vision' },
      });
    }
  }

  // Leadership entries
  if (hubLeadership && Array.isArray(hubLeadership)) {
    for (const leader of hubLeadership) {
      const nameParts = (leader.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      items.push({
        id: `leader-${leader.id}`,
        systemType: 'hub',
        category: 'DESA Hub',
        title: leader.role ? `${leader.role} — ${leader.name}` : leader.name,
        description: `${leader.role || 'Leader'} at DESA. Term: ${leader.term_start}${leader.term_end ? '-' + leader.term_end : '-present'}.`,
        tags: [
          'leadership', 'executive', 'committee', 'board', 'officer',
          'president', 'vice president', 'secretary', 'treasurer',
          'welfare officer', 'publicity', 'governing', 'office bearer',
          'desa', 'student leader', 'representative',
          (leader.role || '').toLowerCase(),
          (leader.name || '').toLowerCase(),
          firstName.toLowerCase(), lastName.toLowerCase(),
          leader.bio ? (leader.bio.toLowerCase()) : '',
        ].filter(Boolean),
        rawItem: leader,
      });
    }
  }

  // Constitution articles
  if (hubConstitution) {
    const constItems = Array.isArray(hubConstitution.articles) ? hubConstitution.articles : [];
    if (hubConstitution.title) {
      items.push({
        id: 'hub-constitution',
        systemType: 'hub',
        category: 'DESA Hub',
        title: hubConstitution.title,
        description: hubConstitution.preamble || '',
        tags: [
          'constitution', 'governing document', 'rules', 'bylaws',
          'articles', 'chapters', 'framework', 'legal',
          'desa', 'student association', 'governance', 'charter',
          (hubConstitution.title).toLowerCase(),
          hubConstitution.preamble ? (hubConstitution.preamble.toLowerCase()) : '',
        ].filter(Boolean),
        rawItem: hubConstitution,
      });
    }
    for (const article of constItems) {
      items.push({
        id: `const-${article.id}`,
        systemType: 'hub',
        category: 'DESA Hub',
        title: article.article_number ? `${article.article_number}: ${article.title}` : article.title,
        description: article.content || '',
        tags: [
          'constitution', 'article', 'chapter', 'governing', 'rule',
          'desa', 'student rights', 'membership', 'officers', 'meetings',
          'finance', 'amendment',
          (article.title || '').toLowerCase(),
          (article.content || '').toLowerCase(),
        ].filter(Boolean),
        rawItem: article,
      });
    }
  }

  // Committees
  if (hubCommittees && Array.isArray(hubCommittees)) {
    for (const committee of hubCommittees) {
      items.push({
        id: `committee-${committee.id}`,
        systemType: 'hub',
        category: 'DESA Hub',
        title: committee.name,
        description: committee.description || '',
        tags: [
          'committee', 'body', 'group', 'working group',
          'welfare', 'academic', 'publicity', 'finance',
          'events', 'legal', 'constitution',
          'desa', 'student affairs', 'governing',
          (committee.name || '').toLowerCase(),
          (committee.description || '').toLowerCase(),
        ].filter(Boolean),
        rawItem: committee,
      });
    }
  }

  // Archives
  if (hubArchives && Array.isArray(hubArchives)) {
    for (const archive of hubArchives) {
      items.push({
        id: `archive-${archive.id}`,
        systemType: 'hub',
        category: 'DESA Hub',
        title: archive.title,
        description: archive.description || '',
        tags: [
          'archive', 'document', 'record', 'history',
          'annual report', 'proceedings', 'minutes',
          'desa', 'past events', 'legacy',
          (archive.title || '').toLowerCase(),
        ].filter(Boolean),
        rawItem: archive,
      });
    }
  }

  // Assets
  if (hubAssets && Array.isArray(hubAssets)) {
    for (const asset of hubAssets) {
      items.push({
        id: `asset-${asset.id}`,
        systemType: 'hub',
        category: 'DESA Hub',
        title: asset.item_name,
        description: asset.description || '',
        tags: [
          'asset', 'equipment', 'property', 'inventory',
          'laptop', 'projector', 'furniture', 'sound system',
          'desa', 'resource', 'tool',
          (asset.item_name || '').toLowerCase(),
          (asset.description || '').toLowerCase(),
        ].filter(Boolean),
        rawItem: asset,
      });
    }
  }

  // ── 2. REGIONS & STUDY CENTERS ────────────────────────────────────────
  if (regions && regions.length > 0) {
    for (const region of regions) {
      // Region entry — enriched with full searchable text
      const regionTags = [
        'region', 'directorate', 'study centers', 'campus', 'hub',
        'distance learning', 'regional office', 'regional coordinator',
        region.name.toLowerCase(), (region.short_name || '').toLowerCase(),
        (region.capital || '').toLowerCase(), (region.slug || '').toLowerCase(),
        (region.description || '').toLowerCase(),
      ];
      items.push({
        id: `region-${region.slug}`,
        systemType: 'region',
        category: 'Study Centers',
        title: region.name,
        region: region.name,
        regionShort: region.short_name,
        capital: region.capital,
        description: region.description || '',
        centersCount: region.center_count || (region.centers?.length || 0),
        tags: regionTags.filter(Boolean),
        rawItem: region,
      });

      if (region.centers) {
        for (const center of region.centers) {
          const nearbyHotels  = center.nearbyHotels ?? center.nearby_hotels ?? [];
          const nearbyHealth  = center.nearbyHealth ?? center.nearby_health ?? [];
          const nearbyRest    = center.nearbyRestaurants ?? center.nearby_restaurants ?? [];
          const hotelsNames   = nearbyHotels.map(h => h.name);
          const healthNames   = nearbyHealth.map(h => h.name);
          const foodNames     = nearbyRest.map(r => r.name);
          const associatedPrograms = (center.programs || []).map(p => p.title);
          const coordinator = center.coordinators?.[0] || null;

          items.push({
            id: center.slug,
            systemType: 'center',
            category: 'Study Center',
            title: center.name,
            subtitle: center.city ? `${center.city} · ${center.premises}` : center.premises,
            region: region.name,
            regionShort: region.shortName || region.short_name,
            city: center.city,
            premises: center.premises,
            landmark: center.landmark,
            schedule: center.schedule,
            coordinator: coordinator,
            coordinatorName: coordinator?.full_name || 'Study Center Coordinator',
            coordinatorTitle: coordinator?.title || '',
            coordinatorPhone: coordinator?.phone || '',
            coordinatorEmail: coordinator?.email || '',
            coordinatorOffice: coordinator?.office || '',
            coordinatorHours: coordinator?.office_hours || '',
            description: [center.premises, center.city, center.landmark, center.schedule]
              .filter(Boolean).join('. '),
            programs: associatedPrograms,
            nearbyHotels: nearbyHotels,
            nearbyHealth: nearbyHealth,
            nearbyRestaurants: nearbyRest,
            tags: [
              // Type & category
              'center', 'study center', 'campus', 'distance center', 'hub', 'regional center',
              // Accommodation & amenities
              'hotel', 'accommodation', 'guest house', 'lodge', 'hostel', 'residence',
              'health', 'clinic', 'hospital', 'medical', 'pharmacy', 'emergency',
              'restaurant', 'eatery', 'food', 'dining', 'cafeteria', 'canteen', 'chop bar',
              // Coordinator
              'coordinator', 'contact', 'phone', 'email', 'office', 'hours',
              // Searchable content fields
              center.name.toLowerCase(),
              (center.premises || '').toLowerCase(),
              (center.city || '').toLowerCase(),
              (center.landmark || '').toLowerCase(),
              (center.schedule || '').toLowerCase(),
              (region.name || '').toLowerCase(),
              (region.short_name || '').toLowerCase(),
              (center.slug || '').toLowerCase(),
              // Program names
              ...associatedPrograms.map(p => p.toLowerCase()),
              // Nearby amenities
              ...hotelsNames.map(h => h.toLowerCase()),
              ...healthNames.map(h => h.toLowerCase()),
              ...foodNames.map(f => f.toLowerCase()),
              // Coordinator info
              coordinator?.full_name?.toLowerCase() || '',
              coordinator?.email?.toLowerCase() || '',
              coordinator?.phone?.toLowerCase() || '',
              coordinator?.office?.toLowerCase() || '',
              coordinator?.office_hours?.toLowerCase() || '',
            ].filter(Boolean),
            rawItem: { ...center, regionName: region.name },
          });
        }
      }
    }
  }

  // ── 3. ACADEMIC PROGRAMS ──────────────────────────────────────────────
  if (programs && programs.length > 0) {
    for (const prog of programs) {
      const centerNames = (prog.available_centers || []).map(c => c.name);
      items.push({
        id: `program-${prog.slug || prog.id}`,
        systemType: 'program',
        category: 'Study Centers',
        title: prog.title,
        subtitle: prog.code ? `${prog.code} · ${prog.department}` : prog.department,
        region: 'All Regions',
        description: [prog.description, prog.level, prog.mode, prog.faculty]
          .filter(Boolean).join('. '),
        tags: [
          'program', 'course', 'degree', 'diploma', 'academic', 'study',
          'curriculum', 'enrollment', 'registration',
          prog.title.toLowerCase(),
          (prog.code || '').toLowerCase(),
          (prog.department || '').toLowerCase(),
          (prog.faculty || '').toLowerCase(),
          (prog.level || '').toLowerCase(),
          (prog.mode || '').toLowerCase(),
          'education', 'teacher training', 'distance education',
          ...centerNames.map(n => n.toLowerCase()),
        ].filter(Boolean),
        rawItem: prog,
      });
    }
  }

  // ── 4. ANNOUNCEMENTS ──────────────────────────────────────────────────
  if (announcements && announcements.length > 0) {
    for (const ann of announcements) {
      const typeLabels = {
        'announcement': 'announcement', 'notice': 'notice',
        'urgent': 'urgent', 'policy': 'policy',
      };
      items.push({
        id: `ann-${ann.id}`,
        systemType: 'announcement',
        category: 'Announcement Hub',
        title: ann.title,
        subtitle: typeLabels[ann.type] ? typeLabels[ann.type].toUpperCase() : '',
        date: ann.published_at || ann.created_at,
        description: [ann.excerpt, ann.body].filter(Boolean).join(' '),
        tags: [
          'announcement', 'news', 'notice', 'official', 'update',
          'alert', 'message', 'communication',
          'registrar', 'academic', 'examination', 'registration', 'fees',
          'deadline', 'important', 'reminder',
          'uew', 'distance learner', 'student',
          (ann.title || '').toLowerCase(),
          (ann.excerpt || '').toLowerCase(),
          (ann.body || '').toLowerCase(),
          ...(ann.type ? [(ann.type).toLowerCase()] : []),
        ].filter(Boolean),
        rawItem: ann,
      });
    }
  }

  // ── 5. EVENTS ─────────────────────────────────────────────────────────
  if (events && events.length > 0) {
    for (const evt of events) {
      items.push({
        id: `evt-${evt.id}`,
        systemType: 'event',
        category: 'DESA Hub',
        title: evt.title,
        subtitle: evt.venue || evt.location || '',
        date: evt.start_date,
        description: [evt.excerpt, evt.body, evt.venue, evt.location]
          .filter(Boolean).join(' '),
        tags: [
          'event', 'activity', 'activities', 'calendar', 'congress', 'gala',
          'conference', 'meeting', 'symposium', 'workshop', 'seminar',
          'competition', 'quiz', 'orientation', ' Induction', 'graduation',
          'desa', 'student', 'academic', 'social',
          (evt.title || '').toLowerCase(),
          (evt.venue || '').toLowerCase(),
          (evt.location || '').toLowerCase(),
          (evt.type || '').toLowerCase(),
        ].filter(Boolean),
        rawItem: evt,
      });
    }
  }

  // ── 6. ACADEMICS ──────────────────────────────────────────────────────
  if (academics && academics.length > 0) {
    const catLabels = {
      'peer_ppt': 'Academic Peer PPT',
      'academic_vault': '24/7 Academic Vault',
      'study_material': '24/7 Academic Vault',
      'past_questions': '24/7 Academic Vault',
      'lecture_notes': 'Academic Peer PPT',
      'syllabus': 'Academic Peer PPT',
      'reading_list': '24/7 Academic Vault',
    };
    for (const acad of academics) {
      items.push({
        id: `acad-${acad.id}`,
        systemType: 'academic',
        category: catLabels[acad.category] || 'Academic Peer PPT',
        title: acad.title,
        subtitle: acad.course_code ? `${acad.course_code} · ${acad.course_title || ''}` : '',
        description: acad.description || '',
        program: acad.course_title || '',
        level: acad.level ? `Level ${acad.level}` : '',
        date: acad.academic_year || '2025/2026 Academic Year',
        fileSize: acad.file_size || 'PDF Document',
        fileType: acad.file_type || 'PDF Document',
        downloadUrl: acad.file_url || '#',
        tags: [
          'academic', 'resource', 'study material', 'lecture notes',
          'past questions', 'exam', 'exam questions', 'ppt', 'presentation',
          'syllabus', 'reading list', 'vault', 'course', 'subject',
          'assignment', 'revision', 'study guide', 'notes',
          'pdf', 'document', 'download',
          (acad.title || '').toLowerCase(),
          (acad.course_code || '').toLowerCase(),
          (acad.course_title || '').toLowerCase(),
          (acad.description || '').toLowerCase(),
          ...(Array.isArray(acad.tags) ? acad.tags.map(t => t.toLowerCase()) : []),
          ...(acad.tags && typeof acad.tags === 'string' ? acad.tags.split(',').map(t => t.trim().toLowerCase()) : []),
        ].filter(Boolean),
        rawItem: acad,
      });
    }
  }

  // ── 7. OPPORTUNITIES ──────────────────────────────────────────────────
  if (opportunities && opportunities.length > 0) {
    const catLabels = {
      'opportunity_radar': 'DESA Opportunity Radar',
      'internship': 'Internship Opportunity Network',
      'digital_board': 'Digital Student Opportunity Board',
      'supervisor_connection': 'Supervisor Connection Initiative',
      'welfare': 'Welfare',
      'alumni': 'Alumni',
    };
    for (const opp of opportunities) {
      items.push({
        id: `opp-${opp.id}`,
        systemType: 'academic',
        category: catLabels[opp.category] || 'DESA Opportunity Radar',
        title: opp.title,
        subtitle: opp.organization || '',
        description: opp.description || '',
        program: opp.organization || '',
        level: opp.location || '',
        date: opp.deadline || '',
        fileSize: '',
        fileType: 'Opportunity',
        downloadUrl: opp.application_link || '#',
        tags: [
          'opportunity', 'opportunities', 'radar', 'internship', 'placement',
          'scholarship', 'bursary', 'grant', 'funding', 'financial aid',
          'welfare', 'support', 'alumni', 'mentorship',
          'career', 'job', 'employment', 'networking',
          'deadline', 'application', 'registration',
          (opp.title || '').toLowerCase(),
          (opp.description || '').toLowerCase(),
          (opp.organization || '').toLowerCase(),
          (opp.location || '').toLowerCase(),
          (opp.category || '').toLowerCase(),
        ].filter(Boolean),
        rawItem: opp,
      });
    }
  }

  // ── Fallback to local mock data if API returned nothing ───────────────
  if (items.length === 0) {
    const mockData = await getPublicMockDataLocal();
    if (Array.isArray(mockData)) {
      mockData.forEach((item) => {
        items.push({
          id: item.id,
          systemType: 'academic',
          category: item.category || 'DESA Hub',
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
    }
  }

  return items;
}

/**
 * Searches the unified directory. Falls back to local search if no API data.
 * Supports multi-token AND matching and fuzzy partial matches.
 */
export function searchDirectory(items, query = '', category = 'All') {
  const cleanQuery = (query || '').trim().toLowerCase();
  const queryTokens = cleanQuery ? cleanQuery.split(/\s+/).filter(Boolean) : [];

  return items.filter((item) => {
    // Category filter
    if (category !== 'All' && category !== '') {
      if (item.category?.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
    }
    // No query = show all
    if (queryTokens.length === 0) return true;

    // Build comprehensive searchable text from ALL fields
    const searchableFields = [
      item.title, item.subtitle, item.description, item.category,
      item.program, item.level, item.region, item.regionShort,
      item.capital, item.city, item.premises, item.landmark,
      item.coordinatorName, item.coordinatorPhone, item.coordinatorEmail,
      item.coordinatorOffice, item.coordinatorHours, item.coordinatorTitle,
      item.location, item.schedule, item.date,
      ...(item.programs || []), ...(item.tags || []),
      // Include hub-specific fields that may not be in the standard tags array
      item.content, item.mission, item.vision, item.subtitle,
      item.article_number, item.year, item.item_name,
    ].filter(Boolean);

    const searchableText = searchableFields.join(' ').toLowerCase();

    // Every query token must appear somewhere (AND logic)
    return queryTokens.every((token) => searchableText.includes(token));
  });
}

// ─── Region-specific center fetching ────────────────────────────────────────
export async function getPublicCentersData() {
  const regions = await fetchRegions();
  if (!regions || regions.length === 0) {
    return [];
  }
  return regions.map(r => ({
    id: r.slug,
    name: r.name,
    shortName: r.shortName,
    capital: r.capital,
    code: r.code,
    description: r.description,
    programs: r.programs || [],
    centers: r.centers || [],
  }));
}

export async function getPublicAnnouncements() {
  const [announcements, events] = await Promise.all([
    fetchAnnouncements(),
    fetchEvents(),
  ]);
  return {
    announcements: announcements || [],
    events: events || [],
  };
}

export function getPublicMockData() {
  return getPublicMockDataLocal();
}
