import React, { useState } from 'react';
import { Calendar, Download, MapPin, Clock, AlertCircle, CalendarRange, CalendarCheck } from 'lucide-react';

const ShabbatCalendarBlocker = () => {
  const [events, setEvents] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Form state
  const [zipCode, setZipCode] = useState('02067');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [city, setCity] = useState('');
  const [locationName, setLocationName] = useState('Sharon, MA');
  const [lookingUpLocation, setLookingUpLocation] = useState(false);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endYear, setEndYear] = useState(new Date().getFullYear() + 3);
  const [minutesBefore, setMinutesBefore] = useState(15);
  
  // Optional holidays checkboxes
  const [optionalDays, setOptionalDays] = useState({
    erevRoshHashana: false,
    erevYomKippur: false,
    cholHamoedSukkot: false,
    hoshannaRabba: false,
    purim: false,
    erevPesach: false,
    cholHamoedPesach: false,
    tishaBAv: false
  });

  // Lookup location by ZIP code or city name
  const lookupLocation = async () => {
    if (!zipCode && !city) {
      setError('Please enter a ZIP code or city name');
      return;
    }
    
    setLookingUpLocation(true);
    setError(null);
    
    try {
      const query = zipCode || city;
      // Use the shabbat endpoint to validate location
      const response = await fetch(`https://www.hebcal.com/shabbat?cfg=json&geo=zip&zip=${encodeURIComponent(query)}&M=on`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.location) {
          setLocationName(`${data.location.title}`);
          // Auto-populate coordinates
          if (data.location.latitude && data.location.longitude) {
            setLatitude(data.location.latitude.toString());
            setLongitude(data.location.longitude.toString());
          }
        } else {
          setError('Location not found. Please try a different ZIP code or city name.');
        }
      } else {
        setError('Unable to look up location. Please try again.');
      }
    } catch (err) {
      console.error('Location lookup error:', err);
      setError('Error looking up location. Please check your internet connection.');
    } finally {
      setLookingUpLocation(false);
    }
  };

  const generateEvents = async () => {
    if (!zipCode && !latitude && !longitude) {
      setError('Please enter a ZIP code or coordinates');
      return;
    }

    setGenerating(true);
    setError(null);
    
    try {
      const allEvents = [];
      
      // Fetch data for each year
      for (let year = startYear; year <= endYear; year++) {
        // Build API URL with all necessary parameters
        const params = new URLSearchParams({
          v: '1',
          cfg: 'json',
          year: year.toString(),
          month: 'x',      // Entire year
          maj: 'on',       // Major holidays
          min: 'on',       // Minor holidays
          nx: 'on',        // Rosh Chodesh
          mf: 'on',        // Minor fasts
          mod: 'on',       // Modern holidays
          s: 'on',         // Parashat haShavua (Torah readings)
          c: 'on',         // Candle lighting
          M: 'on',         // Havdalah
          o: 'on',         // Omer count
          lg: 's'          // Sephardic transliteration
        });
        
        // Use coordinates if provided, otherwise use ZIP
        if (latitude && longitude) {
          params.set('geo', 'pos');
          params.set('latitude', latitude);
          params.set('longitude', longitude);
        } else {
          params.set('geo', 'zip');
          params.set('zip', zipCode);
        }
        
        const url = `https://www.hebcal.com/hebcal?${params.toString()}`;
        
        console.log(`Fetching data for ${year}...`);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch calendar data for ${year} (HTTP ${response.status})`);
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
          console.warn(`No events returned for ${year}`);
          continue;
        }
        
        console.log(`Received ${data.items.length} events for ${year}`);
        
        // Process each event
        data.items.forEach(item => {
          const date = new Date(item.date);
          
          // Handle candle lighting
          if (item.category === 'candles') {
            const candleDate = new Date(item.date);
            const blockStart = new Date(candleDate.getTime() - minutesBefore * 60000);
            const blockEnd = new Date(candleDate);
            blockEnd.setHours(23, 59, 0, 0);
            
            // Add Shabbat block event
            allEvents.push({
              date: candleDate,
              start: blockStart,
              end: blockEnd,
              title: `Shabbat 🕯️`,
              type: 'busy',
              description: `Candle lighting at ${candleDate.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}`
            });
            
            // Add candle lighting event
            const isChanukah = item.memo && item.memo.includes('Chanukah');
            const candleTitle = isChanukah ? `🕯️🕎 ${item.title}` : `🕯️ ${item.title}`;
            
            allEvents.push({
              date: candleDate,
              start: candleDate,
              end: new Date(candleDate.getTime() + 15 * 60000),
              title: candleTitle,
              type: 'busy-false',
              description: item.memo || 'Candle lighting'
            });
          }
          
          // Handle Havdalah
          else if (item.category === 'havdalah') {
            const havdalahDate = new Date(item.date);
            const isChanukah = item.memo && item.memo.includes('Chanukah');
            const havdalahTitle = isChanukah ? `✨🕎 ${item.title}` : `✨ ${item.title}`;
            
            allEvents.push({
              date: havdalahDate,
              start: havdalahDate,
              end: new Date(havdalahDate.getTime() + 15 * 60000),
              title: havdalahTitle,
              type: 'busy-false',
              description: item.memo || 'End of Shabbat'
            });
          }
          
          // Handle major holidays (Yom Tov)
          else if (item.category === 'holiday' && item.yomtov) {
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 0, 0);
            
            allEvents.push({
              date: date,
              start: dayStart,
              end: dayEnd,
              title: `${item.title} 🕍`,
              type: 'ooo',
              description: item.memo || 'Jewish Holiday'
            });
          }
          
          // Handle optional holidays based on user selection
          else if (item.category === 'holiday' && !item.yomtov) {
            const shouldAddAsOOO = (
              (item.title.includes('Erev Rosh Hashana') && optionalDays.erevRoshHashana) ||
              (item.title.includes('Erev Yom Kippur') && optionalDays.erevYomKippur) ||
              (item.title.includes('Hoshana Raba') && optionalDays.hoshannaRabba) ||
              (item.title.includes('Purim') && optionalDays.purim) ||
              (item.title.includes('Erev Pesach') && optionalDays.erevPesach) ||
              (item.title.includes("Tish'a B'Av") && optionalDays.tishaBAv) ||
              (item.subcat === 'fast' && item.title.includes("Tish'a B'Av") && optionalDays.tishaBAv)
            );
            
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 0, 0);
            
            if (shouldAddAsOOO) {
              allEvents.push({
                date: date,
                start: dayStart,
                end: dayEnd,
                title: `${item.title} 🕍`,
                type: 'ooo',
                description: item.memo || 'Jewish Holiday'
              });
            } else {
              // Add as label
              allEvents.push({
                date: date,
                start: dayStart,
                end: dayEnd,
                title: item.title,
                type: 'busy-false',
                description: item.memo || 'Jewish Observance'
              });
            }
          }
          
          // Handle Chol HaMoed (intermediate days)
          else if (item.title && (item.title.includes('Chol ha-Moed') || item.title.includes('Chol HaMoed'))) {
            const shouldAddAsOOO = (
              (item.title.includes('Sukkot') && optionalDays.cholHamoedSukkot) ||
              (item.title.includes('Pesach') && optionalDays.cholHamoedPesach)
            );
            
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 0, 0);
            
            if (shouldAddAsOOO) {
              allEvents.push({
                date: date,
                start: dayStart,
                end: dayEnd,
                title: `${item.title} 🕍`,
                type: 'ooo',
                description: item.memo || 'Jewish Holiday'
              });
            } else {
              allEvents.push({
                date: date,
                start: dayStart,
                end: dayEnd,
                title: item.title,
                type: 'busy-false',
                description: item.memo || 'Jewish Observance'
              });
            }
          }
          
          // Handle Torah portions
          else if (item.category === 'parashat') {
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 0, 0);
            
            allEvents.push({
              date: date,
              start: dayStart,
              end: dayEnd,
              title: `📖 ${item.title}`,
              type: 'busy-false',
              description: item.memo || 'Weekly Torah portion'
            });
          }
          
          // Handle Rosh Chodesh, fast days, and other observances
          else if (item.category === 'roshchodesh' || item.subcat === 'fast' || item.category === 'omer') {
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 0, 0);
            
            allEvents.push({
              date: date,
              start: dayStart,
              end: dayEnd,
              title: item.title,
              type: 'busy-false',
              description: item.memo || 'Jewish Observance'
            });
          }
        });
      }
      
      allEvents.sort((a, b) => a.start - b.start);
      setEvents(allEvents);
      console.log(`Total events generated: ${allEvents.length}`);
    } catch (err) {
      setError(err.message);
      console.error('Error generating events:', err);
    } finally {
      setGenerating(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatICSDate = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
  };

  const downloadICS = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Jewish Calendar Blocker//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Jewish Calendar',
      'X-WR-TIMEZONE:America/New_York'
    ];

    events.forEach((event, index) => {
      const transp = (event.type === 'ooo' || event.type === 'busy') ? 'OPAQUE' : 'TRANSPARENT';
      
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:jewish-${index}-${Date.now()}@jewishcalendar`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(event.start)}`,
        `DTEND:${formatICSDate(event.end)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description}`,
        `TRANSP:${transp}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jewish-calendar.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Event', 'Start Time', 'End Time', 'Type', 'Description'];
    const rows = events.map(event => [
      formatDate(event.date),
      event.title,
      formatTime(event.start),
      formatTime(event.end),
      event.type === 'ooo' ? 'Out of Office' : event.type === 'busy' ? 'Busy' : 'Label',
      event.description
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jewish-calendar.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">Jewish Calendar Blocker</h1>
              <p className="text-sm text-gray-600 mt-1">Powered by Hebcal API</p>
            </div>
            <a 
              href="https://buymeacoffee.com/danw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-medium transition-colors"
            >
              ☕ Buy me a coffee
            </a>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">What this tool does:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Uses the official Hebcal API for Jewish calendar dates and times</li>
                  <li>Automatically calculates candle lighting and Havdalah times for your location</li>
                  <li>Blocks your calendar from before candle lighting until 11:59 PM each Friday (shows as "Busy")</li>
                  <li>Marks major holidays as "Out of Office"</li>
                  <li>Adds labels for Torah portions, Rosh Chodesh, fast days, Sefirat HaOmer, and more</li>
                  <li>Works for any year - past, present, or future!</li>
                </ul>
                <p className="mt-3 text-xs text-yellow-800 bg-yellow-100 p-2 rounded">
                  ⚠️ <strong>Important:</strong> While this tool uses authoritative sources (Hebcal.com), you should always verify zmanim (halachic times) and Jewish calendar dates before relying on them for observance.
                </p>
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="mt-3 text-blue-700 underline hover:text-blue-900 font-medium"
                >
                  {showInstructions ? '▼ Hide' : '▶'} How to import into your calendar
                </button>
              </div>
            </div>
          </div>

          {showInstructions && (
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">📅 Import Instructions</h3>
              
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Google Calendar:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Download the ICS file using the button above</li>
                    <li>Open <a href="https://calendar.google.com" target="_blank" rel="noopener" className="text-blue-600 underline">Google Calendar</a> on a computer</li>
                    <li>Click the gear icon (⚙️) → Settings</li>
                    <li>Click "Import & Export" in the left sidebar</li>
                    <li>Click "Select file from your computer" and choose the downloaded ICS file</li>
                    <li>Choose which calendar to add events to</li>
                    <li>Click "Import"</li>
                  </ol>
                </div>

                <div>
                  <p className="font-semibold text-gray-800 mb-1">Apple Calendar (Mac/iPhone):</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Download the ICS file</li>
                    <li>Double-click the ICS file (Mac) or tap it (iPhone)</li>
                    <li>Choose which calendar to add events to</li>
                    <li>Click "OK" or "Add"</li>
                  </ol>
                </div>

                <div>
                  <p className="font-semibold text-gray-800 mb-1">Outlook.com / Office 365:</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Download the ICS file</li>
                    <li>Open <a href="https://outlook.office.com/calendar" target="_blank" rel="noopener" className="text-blue-600 underline">Outlook Calendar</a></li>
                    <li>Click "Add calendar" in the left sidebar</li>
                    <li>Select "Upload from file"</li>
                    <li>Choose your ICS file and select which calendar to import to</li>
                    <li>Click "Import"</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h2 className="font-semibold text-gray-800">Location</h2>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">US ZIP Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="02067"
                  />
                  <button
                    onClick={lookupLocation}
                    disabled={lookingUpLocation || !zipCode}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                  >
                    {lookingUpLocation ? '...' : 'Lookup'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {lookingUpLocation ? 'Looking up location...' : locationName ? `Location: ${locationName}` : 'Enter ZIP and click Lookup'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-600 mb-2 font-semibold">OR enter coordinates manually:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                    <input
                      type="text"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="42.1237"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                    <input
                      type="text"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="-71.1787"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Coordinates auto-populate when you look up a ZIP code
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h2 className="font-semibold text-gray-800">Shabbat Prep Time</h2>
              </div>
              <label className="block text-sm text-gray-700 mb-2">Minutes before candle lighting to begin blocking calendar</label>
              <input
                type="number"
                value={minutesBefore}
                onChange={(e) => setMinutesBefore(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="0"
                max="60"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CalendarRange className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-gray-800">Year Range</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Start Year</label>
                <input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1900"
                  max="2100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">End Year</label>
                <input
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1900"
                  max="2100"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-gray-800">Optional Out of Office Days</h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">Check any of the following additional days that you'd like to mark as "Out of Office" in your calendar. Unchecked days will be added as labels only. (Major Holidays with Issur Melacha are always marked as "Out of Office")</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                ['erevRoshHashana', 'Erev Rosh Hashana'],
                ['erevYomKippur', 'Erev Yom Kippur'],
                ['cholHamoedSukkot', 'Chol Hamoed Sukkot'],
                ['hoshannaRabba', 'Hoshanna Rabba'],
                ['purim', 'Purim'],
                ['erevPesach', 'Erev Pesach'],
                ['cholHamoedPesach', 'Chol Hamoed Pesach'],
                ['tishaBAv', "Tisha B'Av"]
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={optionalDays[key]}
                    onChange={() => setOptionalDays(prev => ({ ...prev, [key]: !prev[key] }))}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-4 mb-6">
            <button
              onClick={generateEvents}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              <Calendar className="w-5 h-5" />
              {generating ? 'Generating...' : 'Generate Calendar'}
            </button>

            {events.length > 0 && (
              <>
                <button
                  onClick={downloadICS}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Download ICS ({events.length} events)
                </button>
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Download CSV
                </button>
              </>
            )}
          </div>

          {events.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {events.length} events generated
              </h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Legend:</strong> 🕍 = OOO • 🕯️ = Shabbat block (Busy) • 📖 = Parshah • ✨ = Havdalah • 🕎 = Chanukah
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Event</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {events.slice(0, 50).map((event, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {formatDate(event.date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {event.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatTime(event.start)} - {formatTime(event.end)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            event.type === 'ooo' ? 'bg-red-100 text-red-700' : 
                            event.type === 'busy' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {event.type === 'ooo' ? 'OOO' : event.type === 'busy' ? 'Busy' : 'Label'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {events.length > 50 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-3 text-sm text-gray-500 text-center italic">
                          ... and {events.length - 50} more (all in download)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShabbatCalendarBlocker;
