const API_BASE = '/api';

export async function checkPhone(phoneNumber) {
  const res = await fetch(`${API_BASE}/farmer/check-phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to verify phone number');
  }
  return res.json();
}

export async function registerFarmer(data) {
  const res = await fetch(`${API_BASE}/farmer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to complete registration');
  }
  return res.json();
}

export async function updateFarmerLanguage(phoneNumber, language) {
  const res = await fetch(`${API_BASE}/farmer/language`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, language }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update language');
  }
  return res.json();
}

export async function getLanguagesByState(state) {
  const res = await fetch(`${API_BASE}/farmer/languages?state=${encodeURIComponent(state || '')}`);
  if (!res.ok) return { languages: [] };
  return res.json();
}

export async function sendMessage(phone, message, language = '') {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, message, language }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to send message');
  }
  return res.json();
}

export async function getChatHistory(phone) {
  const res = await fetch(`${API_BASE}/chat/history?phone=${encodeURIComponent(phone)}`);
  if (!res.ok) return { messages: [] };
  return res.json();
}

export async function getSoilQuestions(lang = 'en') {
  const res = await fetch(`${API_BASE}/farm/soil-questions?lang=${encodeURIComponent(lang)}`);
  if (!res.ok) return { questions: [] };
  return res.json();
}

export async function submitSoilProfile(phone, answers) {
  const res = await fetch(`${API_BASE}/farm/soil-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, answers }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit soil profile');
  }
  return res.json();
}

export async function getWeather(district = 'Nagpur', state = '') {
  const res = await fetch(`${API_BASE}/farm/weather?district=${encodeURIComponent(district)}&state=${encodeURIComponent(state)}`);
  if (!res.ok) throw new Error('Failed to load weather');
  return res.json();
}

export async function getCropRecommendations(phone, soilType, district, language) {
  const res = await fetch(`${API_BASE}/farm/crop-recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, soilType, district, language }),
  });
  if (!res.ok) throw new Error('Failed to get crop recommendations');
  return res.json();
}

export async function selectCrop(phone, crop) {
  const res = await fetch(`${API_BASE}/farm/select-crop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, crop }),
  });
  if (!res.ok) throw new Error('Failed to select crop');
  return res.json();
}

export async function getDailyPlan(phone, crop, daysSinceSowing = 15, weatherSummary = '', language = '') {
  const res = await fetch(`${API_BASE}/farm/daily-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, crop, daysSinceSowing, weatherSummary, language }),
  });
  if (!res.ok) throw new Error('Failed to load daily plan');
  return res.json();
}

export async function getRecords(phone) {
  const res = await fetch(`${API_BASE}/records?phone=${encodeURIComponent(phone)}`);
  if (!res.ok) throw new Error('Failed to load records');
  return res.json();
}

export async function saveBudget(phone, crop, acres) {
  const res = await fetch(`${API_BASE}/records/budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, crop, acres }),
  });
  if (!res.ok) throw new Error('Failed to save budget');
  return res.json();
}

export async function addExpense(phone, category, amount, description = '', date = null) {
  const res = await fetch(`${API_BASE}/records/expense`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, category, amount, description, date }),
  });
  if (!res.ok) throw new Error('Failed to add expense');
  return res.json();
}

export async function addHistory(phone, action, crop = '', details = '', date = null, amount = null, type = 'activity') {
  const res = await fetch(`${API_BASE}/records/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, action, crop, details, date, amount, type }),
  });
  if (!res.ok) throw new Error('Failed to add history');
  return res.json();
}

export async function undoRecord(phone, recordId = null, type = 'expense') {
  const res = await fetch(`${API_BASE}/records/undo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, recordId, type }),
  });
  if (!res.ok) throw new Error('Failed to undo record');
  return res.json();
}

export async function submitNaturalUpdate(phone, text, language = '') {
  const res = await fetch(`${API_BASE}/records/natural-update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, text, language }),
  });
  if (!res.ok) throw new Error('Failed to process update');
  return res.json();
}

export async function getMarketPrices(crop = '') {
  const res = await fetch(`${API_BASE}/market?crop=${encodeURIComponent(crop || '')}`);
  if (!res.ok) throw new Error('Failed to load market prices');
  return res.json();
}

export async function analyzeCropPhoto(phone, imageBase64, crop = '', language = '', mimeType = 'image/jpeg') {
  const res = await fetch(`${API_BASE}/farm/crop-diagnosis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, imageBase64, crop, language, mimeType }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to analyze crop photo');
  }
  return res.json();
}

export async function syncOfflineEntries(phoneNumber, entries) {
  const res = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, entries }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to sync offline entries');
  }
  return res.json();
}
