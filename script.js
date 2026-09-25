document.addEventListener('DOMContentLoaded', () => {
  const calendarPanel = document.querySelector('.calendar-panel');
  const calendarEmbed = document.getElementById('calendarEmbed');
  const calendarSetup = document.getElementById('calendarSetup');
  const calendarToggle = document.getElementById('calendarToggle');
  const calendarSetupToggle = document.getElementById('calendarSetupToggle');
  const calendarEmbedUrlInput = document.getElementById('calendarEmbedUrl');
  const calendarEmbedUrlSettings = document.getElementById('calendarEmbedUrlSettings');
  const saveCalendarUrl = document.getElementById('saveCalendarUrl');
  const saveCalendarUrlSettings = document.getElementById('saveCalendarUrlSettings');
  const wideWidgetPanel = document.getElementById('wideWidgetPanel');
  const wideWidgetEmbed = document.getElementById('wideWidgetEmbed');
  const wideWidgetToggle = document.getElementById('wideWidgetToggle');

  const getStoredCalendarUrl = () => localStorage.getItem('newtab-google-calendar-embed-url') || '';
  const setStoredCalendarUrl = (value) => localStorage.setItem('newtab-google-calendar-embed-url', value);
  const getCalendarEnabled = () => localStorage.getItem('newtab-calendar-enabled') !== 'false';
  const getWideWidgetEnabled = () => localStorage.getItem('newtab-wide-widget-enabled') !== 'false';
  const wideWidgetUrl = 'https://cschroeder-barstow.github.io/Bookmarker/widget';

  function updateCalendarVisibility() {
    if (!calendarPanel) return;
    const enabled = getCalendarEnabled();
    calendarPanel.classList.toggle('is-hidden', !enabled);
    if (calendarToggle) calendarToggle.checked = enabled;
    if (calendarSetupToggle) calendarSetupToggle.checked = enabled;
  }

  function renderCalendar() {
    const calendarUrl = getStoredCalendarUrl().trim();
    const hasCalendarUrl = calendarUrl.length > 0;

    if (calendarEmbed) {
      calendarEmbed.src = hasCalendarUrl ? calendarUrl : 'about:blank';
      calendarEmbed.classList.toggle('is-visible', hasCalendarUrl);
    }
    if (calendarSetup) calendarSetup.classList.toggle('is-hidden', hasCalendarUrl);
  }

  function saveCalendarEmbedUrl(input) {
    const value = input.value.trim();
    if (!value) {
      localStorage.removeItem('newtab-google-calendar-embed-url');
      renderCalendar();
      return;
    }

    try {
      const url = new URL(value);
      if (url.protocol !== 'https:') throw new Error('URL must use HTTPS');
      setStoredCalendarUrl(url.href);
      input.value = url.href;
      renderCalendar();
    } catch {
      input.setCustomValidity('Paste a valid HTTPS Google Calendar embed URL.');
      input.reportValidity();
      return;
    }
    input.setCustomValidity('');
  }

  function renderWideWidget() {
    const enabled = getWideWidgetEnabled();

    if (wideWidgetPanel) wideWidgetPanel.classList.toggle('is-hidden', !enabled);
    if (wideWidgetEmbed) wideWidgetEmbed.src = enabled ? wideWidgetUrl : 'about:blank';
    if (wideWidgetToggle) wideWidgetToggle.checked = enabled;
  }

  const storedCalendarUrl = getStoredCalendarUrl();
  if (calendarEmbedUrlInput) calendarEmbedUrlInput.value = storedCalendarUrl;
  if (calendarEmbedUrlSettings) calendarEmbedUrlSettings.value = storedCalendarUrl;
  if (saveCalendarUrl && calendarEmbedUrlInput) saveCalendarUrl.addEventListener('click', () => saveCalendarEmbedUrl(calendarEmbedUrlInput));
  if (saveCalendarUrlSettings && calendarEmbedUrlSettings) saveCalendarUrlSettings.addEventListener('click', () => saveCalendarEmbedUrl(calendarEmbedUrlSettings));
  if (calendarToggle) {
    calendarToggle.checked = getCalendarEnabled();
    calendarToggle.addEventListener('change', (event) => {
      localStorage.setItem('newtab-calendar-enabled', String(event.target.checked));
      updateCalendarVisibility();
    });
  }

  if (calendarSetupToggle) {
    calendarSetupToggle.addEventListener('change', (event) => {
      localStorage.setItem('newtab-calendar-enabled', String(event.target.checked));
      updateCalendarVisibility();
    });
  }

  if (wideWidgetToggle) {
    wideWidgetToggle.checked = getWideWidgetEnabled();
    wideWidgetToggle.addEventListener('change', (event) => {
      localStorage.setItem('newtab-wide-widget-enabled', String(event.target.checked));
      renderWideWidget();
    });
  }

  updateCalendarVisibility();
  renderCalendar();
  renderWideWidget();
});

const weatherSearchForm = document.getElementById("weather-search-form");
const cityInput = document.getElementById("city-input");
const description = document.getElementById("description");

weatherSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getweatherData(city);
    }
});

async function getweatherData(city) {
    try {
    description.innerText = "Finding city...";
    const locationResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!locationResponse.ok) {
      throw new Error("Unable to find that city");
        }
    const locationData = await locationResponse.json();
    const location = locationData.results?.[0];
    if (!location) {
      throw new Error("City not found");
    }

    await loadWeather(location.latitude, location.longitude, `${location.name}, ${location.country_code}`);
  } catch (error) {
    description.innerText = error.message;
  }
}

async function loadWeather(latitude, longitude, locationName) {
  description.innerText = "Loading weather...";
  const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=ms`);
    if (!weatherResponse.ok) {
    throw new Error("Unable to load weather");
    }
    const data = await weatherResponse.json();
    const current = data.current;

  document.getElementById('city-name').innerText = locationName;
    description.innerText = weatherDescription(current.weather_code);
    document.getElementById('temperature').innerText = Math.round(current.temperature_2m);
    document.getElementById('humidity').innerText = current.relative_humidity_2m;
    document.getElementById('wind').innerText = current.wind_speed_10m;
}

function weatherDescription(code) {
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy";
  if ([95, 96, 99].includes(code)) return "Thunderstorms";
  return "Current conditions";
}

window.addEventListener("load", () => {
  if (!navigator.geolocation) {
    description.innerText = "Location unavailable";
    return;
  }

  description.innerText = "Finding your location...";
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => loadWeather(coords.latitude, coords.longitude, "Your location").catch((error) => {
      description.innerText = error.message;
    }),
    () => {
      description.innerText = "Allow location or search a city";
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
});

// setting
const settingsButton = document.getElementById('settingsButton');
  const settingsPanel = document.getElementById('settingsPanel');
  const backgroundUpload = document.getElementById('backgroundUpload');
  const resetBackground = document.getElementById('resetBackground');
  const defaultBackground = "url('wallpaper.png')";

  const savedBackground = localStorage.getItem('newtab-background');
  if (savedBackground) {
    document.body.style.backgroundImage = `url('${savedBackground}')`;
  }

  settingsButton.addEventListener('click', () => {
    const isOpen = settingsPanel.classList.toggle('is-open');
    settingsButton.setAttribute('aria-expanded', isOpen);
    settingsPanel.setAttribute('aria-hidden', !isOpen);
  });

  backgroundUpload.addEventListener('change', (event) => {
    const [file] = event.target.files;
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      document.body.style.backgroundImage = `url('${reader.result}')`;
      localStorage.setItem('newtab-background', reader.result);
    });
    reader.readAsDataURL(file);
  });

  resetBackground.addEventListener('click', () => {
    document.body.style.backgroundImage = defaultBackground;
    localStorage.removeItem('newtab-background');
    backgroundUpload.value = '';
  });
  const timeElement = document.querySelector('#timeElement');

  function updateClock() {
    if (!timeElement) return;

    timeElement.textContent = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  updateClock();
  setInterval(updateClock, 60000);