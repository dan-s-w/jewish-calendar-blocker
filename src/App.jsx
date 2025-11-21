import React, { useState } from 'react';
import { Calendar, Download, Sun, MapPin, Clock, Settings, AlertCircle, CalendarRange, CalendarCheck } from 'lucide-react';

const ShabbatCalendarBlocker = () => {
  const [events, setEvents] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Form state
  const [zipCode, setZipCode] = useState('02067');
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

  // Hardcoded Jewish calendar data for 2024-2028 (from Hebcal)
  // Format: [month, day, holiday name, type]
  const jewishHolidayData = {
    2024: [
      [9, 23, 'Rosh Hashana I', 'major'],
      [9, 24, 'Rosh Hashana II', 'major'],
      [9, 22, 'Erev Rosh Hashana', 'optional'],
      [10, 1, 'Tzom Gedaliah', 'fast'],
      [10, 2, 'Yom Kippur', 'major'],
      [10, 1, 'Erev Yom Kippur', 'optional'],
      [10, 7, 'Sukkot I', 'major'],
      [10, 8, 'Sukkot II', 'major'],
      [10, 9, 'Chol ha-Moed Sukkot I', 'cholhamoed'],
      [10, 10, 'Chol ha-Moed Sukkot II', 'cholhamoed'],
      [10, 11, 'Chol ha-Moed Sukkot III', 'cholhamoed'],
      [10, 12, 'Chol ha-Moed Sukkot IV', 'cholhamoed'],
      [10, 13, 'Hoshana Raba', 'optional'],
      [10, 14, 'Shmini Atzeret', 'major'],
      [10, 15, 'Simchat Torah', 'major'],
      [11, 1, 'Rosh Chodesh Cheshvan', 'roshchodesh'],
      [12, 1, 'Rosh Chodesh Kislev', 'roshchodesh'],
      [12, 26, 'Chanukah 1', 'chanukah'],
      [12, 27, 'Chanukah 2', 'chanukah'],
      [12, 28, 'Chanukah 3', 'chanukah'],
      [12, 29, 'Chanukah 4', 'chanukah'],
      [12, 30, 'Chanukah 5', 'chanukah'],
      [12, 31, 'Chanukah 6', 'chanukah']
    ],
    2025: [
      [1, 1, 'Chanukah 7', 'chanukah'],
      [1, 2, 'Chanukah 8', 'chanukah'],
      [1, 13, 'Asara B\'Tevet', 'fast'],
      [1, 30, 'Rosh Chodesh Shvat', 'roshchodesh'],
      [2, 13, 'Tu BiShvat', 'minor'],
      [2, 28, 'Rosh Chodesh Adar', 'roshchodesh'],
      [3, 14, 'Purim', 'optional'],
      [3, 30, 'Rosh Chodesh Nisan', 'roshchodesh'],
      [4, 12, 'Erev Pesach', 'optional'],
      [4, 13, 'Pesach I', 'major'],
      [4, 14, 'Pesach II', 'major'],
      [4, 15, 'Chol ha-Moed Pesach I', 'cholhamoed'],
      [4, 16, 'Chol ha-Moed Pesach II', 'cholhamoed'],
      [4, 17, 'Chol ha-Moed Pesach III', 'cholhamoed'],
      [4, 18, 'Chol ha-Moed Pesach IV', 'cholhamoed'],
      [4, 19, 'Pesach VII', 'major'],
      [4, 20, 'Pesach VIII', 'major'],
      [4, 27, 'Yom HaShoah', 'israel'],
      [4, 29, 'Rosh Chodesh Iyar', 'roshchodesh'],
      [5, 4, 'Yom HaZikaron', 'israel'],
      [5, 5, 'Yom HaAtzma\'ut', 'israel'],
      [5, 19, 'Lag BaOmer', 'minor'],
      [5, 29, 'Rosh Chodesh Sivan', 'roshchodesh'],
      [6, 2, 'Shavuot I', 'major'],
      [6, 3, 'Shavuot II', 'major'],
      [6, 28, 'Rosh Chodesh Tamuz', 'roshchodesh'],
      [7, 13, 'Tzom Tammuz', 'fast'],
      [7, 28, 'Rosh Chodesh Av', 'roshchodesh'],
      [8, 3, 'Tish\'a B\'Av', 'optional'],
      [8, 26, 'Rosh Chodesh Elul', 'roshchodesh'],
      [9, 23, 'Rosh Hashana I', 'major'],
      [9, 24, 'Rosh Hashana II', 'major'],
      [9, 22, 'Erev Rosh Hashana', 'optional'],
      [10, 1, 'Tzom Gedaliah', 'fast'],
      [10, 2, 'Yom Kippur', 'major'],
      [10, 1, 'Erev Yom Kippur', 'optional'],
      [10, 7, 'Sukkot I', 'major'],
      [10, 8, 'Sukkot II', 'major'],
      [10, 9, 'Chol ha-Moed Sukkot I', 'cholhamoed'],
      [10, 10, 'Chol ha-Moed Sukkot II', 'cholhamoed'],
      [10, 11, 'Chol ha-Moed Sukkot III', 'cholhamoed'],
      [10, 12, 'Chol ha-Moed Sukkot IV', 'cholhamoed'],
      [10, 13, 'Hoshana Raba', 'optional'],
      [10, 14, 'Shmini Atzeret', 'major'],
      [10, 15, 'Simchat Torah', 'major'],
      [11, 1, 'Rosh Chodesh Cheshvan', 'roshchodesh'],
      [12, 1, 'Rosh Chodesh Kislev', 'roshchodesh'],
      [12, 15, 'Chanukah 1', 'chanukah'],
      [12, 16, 'Chanukah 2', 'chanukah'],
      [12, 17, 'Chanukah 3', 'chanukah'],
      [12, 18, 'Chanukah 4', 'chanukah'],
      [12, 19, 'Chanukah 5', 'chanukah'],
      [12, 20, 'Chanukah 6', 'chanukah'],
      [12, 21, 'Chanukah 7', 'chanukah'],
      [12, 22, 'Chanukah 8', 'chanukah']
    ],
    2026: [
      [1, 2, 'Asara B\'Tevet', 'fast'],
      [1, 19, 'Rosh Chodesh Shvat', 'roshchodesh'],
      [2, 2, 'Tu BiShvat', 'minor'],
      [2, 18, 'Rosh Chodesh Adar I', 'roshchodesh'],
      [3, 19, 'Rosh Chodesh Adar II', 'roshchodesh'],
      [3, 3, 'Purim', 'optional'],
      [3, 19, 'Rosh Chodesh Nisan', 'roshchodesh'],
      [4, 1, 'Erev Pesach', 'optional'],
      [4, 2, 'Pesach I', 'major'],
      [4, 3, 'Pesach II', 'major'],
      [4, 4, 'Chol ha-Moed Pesach I', 'cholhamoed'],
      [4, 5, 'Chol ha-Moed Pesach II', 'cholhamoed'],
      [4, 6, 'Chol ha-Moed Pesach III', 'cholhamoed'],
      [4, 7, 'Chol ha-Moed Pesach IV', 'cholhamoed'],
      [4, 8, 'Pesach VII', 'major'],
      [4, 9, 'Pesach VIII', 'major'],
      [4, 16, 'Yom HaShoah', 'israel'],
      [4, 18, 'Rosh Chodesh Iyar', 'roshchodesh'],
      [4, 22, 'Yom HaZikaron', 'israel'],
      [4, 23, 'Yom HaAtzma\'ut', 'israel'],
      [5, 8, 'Lag BaOmer', 'minor'],
      [5, 17, 'Rosh Chodesh Sivan', 'roshchodesh'],
      [5, 22, 'Shavuot I', 'major'],
      [5, 23, 'Shavuot II', 'major'],
      [6, 16, 'Rosh Chodesh Tamuz', 'roshchodesh'],
      [7, 2, 'Tzom Tammuz', 'fast'],
      [7, 16, 'Rosh Chodesh Av', 'roshchodesh'],
      [7, 23, 'Tish\'a B\'Av', 'optional'],
      [8, 14, 'Rosh Chodesh Elul', 'roshchodesh'],
      [9, 12, 'Rosh Hashana I', 'major'],
      [9, 13, 'Rosh Hashana II', 'major'],
      [9, 11, 'Erev Rosh Hashana', 'optional'],
      [9, 14, 'Tzom Gedaliah', 'fast'],
      [9, 21, 'Yom Kippur', 'major'],
      [9, 20, 'Erev Yom Kippur', 'optional'],
      [9, 26, 'Sukkot I', 'major'],
      [9, 27, 'Sukkot II', 'major'],
      [9, 28, 'Chol ha-Moed Sukkot I', 'cholhamoed'],
      [9, 29, 'Chol ha-Moed Sukkot II', 'cholhamoed'],
      [9, 30, 'Chol ha-Moed Sukkot III', 'cholhamoed'],
      [10, 1, 'Chol ha-Moed Sukkot IV', 'cholhamoed'],
      [10, 2, 'Hoshana Raba', 'optional'],
      [10, 3, 'Shmini Atzeret', 'major'],
      [10, 4, 'Simchat Torah', 'major'],
      [10, 13, 'Rosh Chodesh Cheshvan', 'roshchodesh'],
      [11, 12, 'Rosh Chodesh Kislev', 'roshchodesh'],
      [12, 5, 'Chanukah 1', 'chanukah'],
      [12, 6, 'Chanukah 2', 'chanukah'],
      [12, 7, 'Chanukah 3', 'chanukah'],
      [12, 8, 'Chanukah 4', 'chanukah'],
      [12, 9, 'Chanukah 5', 'chanukah'],
      [12, 10, 'Chanukah 6', 'chanukah'],
      [12, 11, 'Chanukah 7', 'chanukah'],
      [12, 12, 'Chanukah 8', 'chanukah'],
      [12, 22, 'Asara B\'Tevet', 'fast']
    ],
    2027: [
      [1, 11, 'Rosh Chodesh Shvat', 'roshchodesh'],
      [1, 25, 'Tu BiShvat', 'minor'],
      [2, 9, 'Rosh Chodesh Adar', 'roshchodesh'],
      [2, 25, 'Purim', 'optional'],
      [3, 11, 'Rosh Chodesh Nisan', 'roshchodesh'],
      [3, 24, 'Erev Pesach', 'optional'],
      [3, 25, 'Pesach I', 'major'],
      [3, 26, 'Pesach II', 'major'],
      [3, 27, 'Chol ha-Moed Pesach I', 'cholhamoed'],
      [3, 28, 'Chol ha-Moed Pesach II', 'cholhamoed'],
      [3, 29, 'Chol ha-Moed Pesach III', 'cholhamoed'],
      [3, 30, 'Chol ha-Moed Pesach IV', 'cholhamoed'],
      [3, 31, 'Pesach VII', 'major'],
      [4, 1, 'Pesach VIII', 'major'],
      [4, 8, 'Yom HaShoah', 'israel'],
      [4, 9, 'Rosh Chodesh Iyar', 'roshchodesh'],
      [4, 14, 'Yom HaZikaron', 'israel'],
      [4, 15, 'Yom HaAtzma\'ut', 'israel'],
      [4, 30, 'Lag BaOmer', 'minor'],
      [5, 9, 'Rosh Chodesh Sivan', 'roshchodesh'],
      [5, 14, 'Shavuot I', 'major'],
      [5, 15, 'Shavuot II', 'major'],
      [6, 7, 'Rosh Chodesh Tamuz', 'roshchodesh'],
      [6, 24, 'Tzom Tammuz', 'fast'],
      [7, 7, 'Rosh Chodesh Av', 'roshchodesh'],
      [7, 14, 'Tish\'a B\'Av', 'optional'],
      [8, 5, 'Rosh Chodesh Elul', 'roshchodesh'],
      [10, 2, 'Rosh Hashana I', 'major'],
      [10, 3, 'Rosh Hashana II', 'major'],
      [10, 1, 'Erev Rosh Hashana', 'optional'],
      [10, 4, 'Tzom Gedaliah', 'fast'],
      [10, 11, 'Yom Kippur', 'major'],
      [10, 10, 'Erev Yom Kippur', 'optional'],
      [10, 16, 'Sukkot I', 'major'],
      [10, 17, 'Sukkot II', 'major'],
      [10, 18, 'Chol ha-Moed Sukkot I', 'cholhamoed'],
      [10, 19, 'Chol ha-Moed Sukkot II', 'cholhamoed'],
      [10, 20, 'Chol ha-Moed Sukkot III', 'cholhamoed'],
      [10, 21, 'Chol ha-Moed Sukkot IV', 'cholhamoed'],
      [10, 22, 'Hoshana Raba', 'optional'],
      [10, 23, 'Shmini Atzeret', 'major'],
      [10, 24, 'Simchat Torah', 'major'],
      [11, 2, 'Rosh Chodesh Cheshvan', 'roshchodesh'],
      [12, 1, 'Rosh Chodesh Kislev', 'roshchodesh'],
      [12, 24, 'Chanukah 1', 'chanukah'],
      [12, 25, 'Chanukah 2', 'chanukah'],
      [12, 26, 'Chanukah 3', 'chanukah'],
      [12, 27, 'Chanukah 4', 'chanukah'],
      [12, 28, 'Chanukah 5', 'chanukah'],
      [12, 29, 'Chanukah 6', 'chanukah'],
      [12, 30, 'Chanukah 7', 'chanukah'],
      [12, 31, 'Chanukah 8', 'chanukah']
    ],
    2028: [
      [1, 11, 'Asara B\'Tevet', 'fast'],
      [1, 31, 'Rosh Chodesh Shvat', 'roshchodesh'],
      [2, 14, 'Tu BiShvat', 'minor'],
      [2, 29, 'Rosh Chodesh Adar I', 'roshchodesh'],
      [3, 30, 'Rosh Chodesh Adar II', 'roshchodesh'],
      [3, 14, 'Purim', 'optional'],
      [3, 30, 'Rosh Chodesh Nisan', 'roshchodesh'],
      [4, 12, 'Erev Pesach', 'optional'],
      [4, 13, 'Pesach I', 'major'],
      [4, 14, 'Pesach II', 'major'],
      [4, 15, 'Chol ha-Moed Pesach I', 'cholhamoed'],
      [4, 16, 'Chol ha-Moed Pesach II', 'cholhamoed'],
      [4, 17, 'Chol ha-Moed Pesach III', 'cholhamoed'],
      [4, 18, 'Chol ha-Moed Pesach IV', 'cholhamoed'],
      [4, 19, 'Pesach VII', 'major'],
      [4, 20, 'Pesach VIII', 'major'],
      [4, 27, 'Yom HaShoah', 'israel'],
      [4, 28, 'Rosh Chodesh Iyar', 'roshchodesh'],
      [5, 3, 'Yom HaZikaron', 'israel'],
      [5, 4, 'Yom HaAtzma\'ut', 'israel'],
      [5, 19, 'Lag BaOmer', 'minor'],
      [5, 28, 'Rosh Chodesh Sivan', 'roshchodesh'],
      [6, 2, 'Shavuot I', 'major'],
      [6, 3, 'Shavuot II', 'major'],
      [6, 26, 'Rosh Chodesh Tamuz', 'roshchodesh'],
      [7, 12, 'Tzom Tammuz', 'fast'],
      [7, 26, 'Rosh Chodesh Av', 'roshchodesh'],
      [8, 2, 'Tish\'a B\'Av', 'optional'],
      [8, 24, 'Rosh Chodesh Elul', 'roshchodesh'],
      [9, 21, 'Rosh Hashana I', 'major'],
      [9, 22, 'Rosh Hashana II', 'major'],
      [9, 20, 'Erev Rosh Hashana', 'optional'],
      [9, 23, 'Tzom Gedaliah', 'fast'],
      [9, 30, 'Yom Kippur', 'major'],
      [9, 29, 'Erev Yom Kippur', 'optional'],
      [10, 5, 'Sukkot I', 'major'],
      [10, 6, 'Sukkot II', 'major'],
      [10, 7, 'Chol ha-Moed Sukkot I', 'cholhamoed'],
      [10, 8, 'Chol ha-Moed Sukkot II', 'cholhamoed'],
      [10, 9, 'Chol ha-Moed Sukkot III', 'cholhamoed'],
      [10, 10, 'Chol ha-Moed Sukkot IV', 'cholhamoed'],
      [10, 11, 'Hoshana Raba', 'optional'],
      [10, 12, 'Shmini Atzeret', 'major'],
      [10, 13, 'Simchat Torah', 'major'],
      [10, 23, 'Rosh Chodesh Cheshvan', 'roshchodesh'],
      [11, 21, 'Rosh Chodesh Kislev', 'roshchodesh'],
      [12, 13, 'Chanukah 1', 'chanukah'],
      [12, 14, 'Chanukah 2', 'chanukah'],
      [12, 15, 'Chanukah 3', 'chanukah'],
      [12, 16, 'Chanukah 4', 'chanukah'],
      [12, 17, 'Chanukah 5', 'chanukah'],
      [12, 18, 'Chanukah 6', 'chanukah'],
      [12, 19, 'Chanukah 7', 'chanukah'],
      [12, 20, 'Chanukah 8', 'chanukah'],
      [12, 30, 'Asara B\'Tevet', 'fast']
    ],
    2029: [
      [1, 10, 'Rosh Chodesh Shvat', 'roshchodesh'],
      [1, 24, 'Tu BiShvat', 'minor'],
      [2, 8, 'Rosh Chodesh Adar', 'roshchodesh'],
      [2, 22, 'Ta\'anit Esther', 'fast'],
      [2, 28, 'Purim', 'optional'],
      [3, 10, 'Rosh Chodesh Nisan', 'roshchodesh'],
      [3, 30, 'Erev Pesach', 'optional'],
      [3, 31, 'Pesach I', 'major'],
      [4, 1, 'Pesach II', 'major'],
      [4, 2, 'Chol ha-Moed Pesach I', 'cholhamoed'],
      [4, 3, 'Chol ha-Moed Pesach II', 'cholhamoed'],
      [4, 4, 'Chol ha-Moed Pesach III', 'cholhamoed'],
      [4, 5, 'Chol ha-Moed Pesach IV', 'cholhamoed'],
      [4, 6, 'Pesach VII', 'major'],
      [4, 7, 'Pesach VIII', 'major'],
      [4, 9, 'Rosh Chodesh Iyar', 'roshchodesh'],
      [4, 13, 'Yom HaShoah', 'israel'],
      [4, 19, 'Yom HaZikaron', 'israel'],
      [4, 20, 'Yom HaAtzma\'ut', 'israel'],
      [5, 2, 'Lag BaOmer', 'minor'],
      [5, 9, 'Rosh Chodesh Sivan', 'roshchodesh'],
      [5, 19, 'Shavuot I', 'major'],
      [5, 20, 'Shavuot II', 'major'],
      [6, 7, 'Rosh Chodesh Tamuz', 'roshchodesh'],
      [6, 24, 'Tzom Tammuz', 'fast'],
      [7, 7, 'Rosh Chodesh Av', 'roshchodesh'],
      [7, 21, 'Tish\'a B\'Av', 'optional'],
      [8, 5, 'Rosh Chodesh Elul', 'roshchodesh'],
      [9, 9, 'Rosh Hashana I', 'major'],
      [9, 10, 'Rosh Hashana II', 'major'],
      [9, 8, 'Erev Rosh Hashana', 'optional'],
      [9, 11, 'Tzom Gedaliah', 'fast'],
      [9, 18, 'Yom Kippur', 'major'],
      [9, 17, 'Erev Yom Kippur', 'optional'],
      [9, 23, 'Sukkot I', 'major'],
      [9, 24, 'Sukkot II', 'major'],
      [9, 25, 'Chol ha-Moed Sukkot I', 'cholhamoed'],
      [9, 26, 'Chol ha-Moed Sukkot II', 'cholhamoed'],
      [9, 27, 'Chol ha-Moed Sukkot III', 'cholhamoed'],
      [9, 28, 'Chol ha-Moed Sukkot IV', 'cholhamoed'],
      [9, 29, 'Hoshana Raba', 'optional'],
      [9, 30, 'Shmini Atzeret', 'major'],
      [10, 1, 'Simchat Torah', 'major'],
      [10, 9, 'Rosh Chodesh Cheshvan', 'roshchodesh'],
      [11, 8, 'Rosh Chodesh Kislev', 'roshchodesh'],
      [12, 1, 'Chanukah 1', 'chanukah'],
      [12, 2, 'Chanukah 2', 'chanukah'],
      [12, 3, 'Chanukah 3', 'chanukah'],
      [12, 4, 'Chanukah 4', 'chanukah'],
      [12, 5, 'Chanukah 5', 'chanukah'],
      [12, 6, 'Chanukah 6', 'chanukah'],
      [12, 7, 'Chanukah 7', 'chanukah'],
      [12, 8, 'Chanukah 8', 'chanukah']
    ],
    2030: [
      [1, 19, 'Asara B\'Tevet', 'fast'],
      [1, 30, 'Rosh Chodesh Shvat', 'roshchodesh'],
      [2, 13, 'Tu BiShvat', 'minor'],
      [2, 28, 'Rosh Chodesh Adar', 'roshchodesh'],
      [3, 11, 'Ta\'anit Esther', 'fast'],
      [3, 18, 'Purim', 'optional'],
      [3, 30, 'Rosh Chodesh Nisan', 'roshchodesh'],
      [4, 17, 'Erev Pesach', 'optional'],
      [4, 18, 'Pesach I', 'major'],
      [4, 19, 'Pesach II', 'major'],
      [4, 20, 'Chol ha-Moed Pesach I', 'cholhamoed'],
      [4, 21, 'Chol ha-Moed Pesach II', 'cholhamoed'],
      [4, 22, 'Chol ha-Moed Pesach III', 'cholhamoed'],
      [4, 23, 'Chol ha-Moed Pesach IV', 'cholhamoed'],
      [4, 24, 'Pesach VII', 'major'],
      [4, 25, 'Pesach VIII', 'major'],
      [4, 29, 'Rosh Chodesh Iyar', 'roshchodesh'],
      [5, 2, 'Yom HaShoah', 'israel'],
      [5, 8, 'Yom HaZikaron', 'israel'],
      [5, 9, 'Yom HaAtzma\'ut', 'israel'],
      [5, 20, 'Lag BaOmer', 'minor'],
      [5, 29, 'Rosh Chodesh Sivan', 'roshchodesh'],
      [6, 6, 'Shavuot I', 'major'],
      [6, 7, 'Shavuot II', 'major'],
      [6, 28, 'Rosh Chodesh Tamuz', 'roshchodesh'],
      [7, 13, 'Tzom Tammuz', 'fast'],
      [7, 28, 'Rosh Chodesh Av', 'roshchodesh'],
      [8, 7, 'Tish\'a B\'Av', 'optional'],
      [8, 26, 'Rosh Chodesh Elul', 'roshchodesh'],
      [9, 27, 'Rosh Hashana I', 'major'],
      [9, 28, 'Rosh Hashana II', 'major'],
      [9, 26, 'Erev Rosh Hashana', 'optional'],
      [9, 29, 'Tzom Gedaliah', 'fast'],
      [10, 6, 'Yom Kippur', 'major'],
      [10, 5, 'Erev Yom Kippur', 'optional'],
      [10, 11, 'Sukkot I', 'major'],
      [10, 12, 'Sukkot II', 'major'],
      [10, 13, 'Chol ha-Moed Sukkot I', 'cholhamoed'],
      [10, 14, 'Chol ha-Moed Sukkot II', 'cholhamoed'],
      [10, 15, 'Chol ha-Moed Sukkot III', 'cholhamoed'],
      [10, 16, 'Chol ha-Moed Sukkot IV', 'cholhamoed'],
      [10, 17, 'Hoshana Raba', 'optional'],
      [10, 18, 'Shmini Atzeret', 'major'],
      [10, 19, 'Simchat Torah', 'major'],
      [11, 1, 'Rosh Chodesh Cheshvan', 'roshchodesh'],
      [12, 1, 'Rosh Chodesh Kislev', 'roshchodesh'],
      [12, 20, 'Chanukah 1', 'chanukah'],
      [12, 21, 'Chanukah 2', 'chanukah'],
      [12, 22, 'Chanukah 3', 'chanukah'],
      [12, 23, 'Chanukah 4', 'chanukah'],
      [12, 24, 'Chanukah 5', 'chanukah'],
      [12, 25, 'Chanukah 6', 'chanukah'],
      [12, 26, 'Chanukah 7', 'chanukah'],
      [12, 27, 'Chanukah 8', 'chanukah']
    ],
    2031: [
      [1, 7, 'Asara B\'Tevet', 'fast'],
      [1, 19, 'Rosh Chodesh Shvat', 'roshchodesh'],
      [2, 2, 'Tu BiShvat', 'minor'],
      [2, 18, 'Rosh Chodesh Adar', 'roshchodesh'],
      [3, 3, 'Ta\'anit Esther', 'fast'],
      [3, 8, 'Purim', 'optional'],
      [3, 19, 'Rosh Chodesh Nisan', 'roshchodesh'],
      [4, 7, 'Erev Pesach', 'optional'],
      [4, 8, 'Pesach I', 'major'],
      [4, 9, 'Pesach II', 'major'],
      [4, 10, 'Chol ha-Moed Pesach I', 'cholhamoed'],
      [4, 11, 'Chol ha-Moed Pesach II', 'cholhamoed'],
      [4, 12, 'Chol ha-Moed Pesach III', 'cholhamoed'],
      [4, 13, 'Chol ha-Moed Pesach IV', 'cholhamoed'],
      [4, 14, 'Pesach VII', 'major'],
      [4, 15, 'Pesach VIII', 'major'],
      [4, 18, 'Rosh Chodesh Iyar', 'roshchodesh'],
      [4, 22, 'Yom HaShoah', 'israel'],
      [4, 28, 'Yom HaZikaron', 'israel'],
      [4, 29, 'Yom HaAtzma\'ut', 'israel'],
      [5, 10, 'Lag BaOmer', 'minor'],
      [5, 17, 'Rosh Chodesh Sivan', 'roshchodesh'],
      [5, 27, 'Shavuot I', 'major'],
      [5, 28, 'Shavuot II', 'major'],
      [6, 16, 'Rosh Chodesh Tamuz', 'roshchodesh'],
      [7, 3, 'Tzom Tammuz', 'fast'],
      [7, 16, 'Rosh Chodesh Av', 'roshchodesh'],
      [7, 28, 'Tish\'a B\'Av', 'optional'],
      [8, 14, 'Rosh Chodesh Elul', 'roshchodesh'],
      [9, 17, 'Rosh Hashana I', 'major'],
      [9, 18, 'Rosh Hashana II', 'major'],
      [9, 16, 'Erev Rosh Hashana', 'optional'],
      [9, 19, 'Tzom Gedaliah', 'fast'],
      [9, 26, 'Yom Kippur', 'major'],
      [9, 25, 'Erev Yom Kippur', 'optional'],
      [10, 1, 'Sukkot I', 'major'],
      [10, 2, 'Sukkot II', 'major'],
      [10, 3, 'Chol ha-Moed Sukkot I', 'cholhamoed'],
      [10, 4, 'Chol ha-Moed Sukkot II', 'cholhamoed'],
      [10, 5, 'Chol ha-Moed Sukkot III', 'cholhamoed'],
      [10, 6, 'Chol ha-Moed Sukkot IV', 'cholhamoed'],
      [10, 7, 'Hoshana Raba', 'optional'],
      [10, 8, 'Shmini Atzeret', 'major'],
      [10, 9, 'Simchat Torah', 'major'],
      [10, 22, 'Rosh Chodesh Cheshvan', 'roshchodesh'],
      [11, 20, 'Rosh Chodesh Kislev', 'roshchodesh'],
      [12, 9, 'Chanukah 1', 'chanukah'],
      [12, 10, 'Chanukah 2', 'chanukah'],
      [12, 11, 'Chanukah 3', 'chanukah'],
      [12, 12, 'Chanukah 4', 'chanukah'],
      [12, 13, 'Chanukah 5', 'chanukah'],
      [12, 14, 'Chanukah 6', 'chanukah'],
      [12, 15, 'Chanukah 7', 'chanukah'],
      [12, 16, 'Chanukah 8', 'chanukah'],
      [12, 27, 'Asara B\'Tevet', 'fast']
    ],
    2032: [
      [1, 9, 'Rosh Chodesh Shvat', 'roshchodesh'],
      [1, 23, 'Tu BiShvat', 'minor'],
      [2, 7, 'Rosh Chodesh Adar I', 'roshchodesh'],
      [3, 8, 'Rosh Chodesh Adar II', 'roshchodesh'],
      [3, 20, 'Ta\'anit Esther', 'fast'],
      [3, 25, 'Purim', 'optional'],
      [4, 7, 'Rosh Chodesh Nisan', 'roshchodesh'],
      [4, 26, 'Erev Pesach', 'optional'],
      [4, 27, 'Pesach I', 'major'],
      [4, 28, 'Pesach II', 'major'],
      [4, 29, 'Chol ha-Moed Pesach I', 'cholhamoed'],
      [4, 30, 'Chol ha-Moed Pesach II', 'cholhamoed'],
      [5, 1, 'Chol ha-Moed Pesach III', 'cholhamoed'],
      [5, 2, 'Chol ha-Moed Pesach IV', 'cholhamoed'],
      [5, 3, 'Pesach VII', 'major'],
      [5, 4, 'Pesach VIII', 'major'],
      [5, 6, 'Rosh Chodesh Iyar', 'roshchodesh'],
      [5, 10, 'Yom HaShoah', 'israel'],
      [5, 16, 'Yom HaZikaron', 'israel'],
      [5, 17, 'Yom HaAtzma\'ut', 'israel'],
      [5, 28, 'Lag BaOmer', 'minor'],
      [6, 5, 'Rosh Chodesh Sivan', 'roshchodesh'],
      [6, 15, 'Shavuot I', 'major'],
      [6, 16, 'Shavuot II', 'major'],
      [7, 4, 'Rosh Chodesh Tamuz', 'roshchodesh'],
      [7, 20, 'Tzom Tammuz', 'fast'],
      [8, 3, 'Rosh Chodesh Av', 'roshchodesh'],
      [8, 15, 'Tish\'a B\'Av', 'optional'],
      [9, 1, 'Rosh Chodesh Elul', 'roshchodesh'],
      [9, 5, 'Rosh Hashana I', 'major'],
      [9, 6, 'Rosh Hashana II', 'major'],
      [9, 4, 'Erev Rosh Hashana', 'optional'],
      [9, 7, 'Tzom Gedaliah', 'fast'],
      [9, 14, 'Yom Kippur', 'major'],
      [9, 13, 'Erev Yom Kippur', 'optional'],
      [9, 19, 'Sukkot I', 'major'],
      [9, 20, 'Sukkot II', 'major'],
      [9, 21, 'Chol ha-Moed Sukkot I', 'cholhamoed'],
      [9, 22, 'Chol ha-Moed Sukkot II', 'cholhamoed'],
      [9, 23, 'Chol ha-Moed Sukkot III', 'cholhamoed'],
      [9, 24, 'Chol ha-Moed Sukkot IV', 'cholhamoed'],
      [9, 25, 'Hoshana Raba', 'optional'],
      [9, 26, 'Shmini Atzeret', 'major'],
      [9, 27, 'Simchat Torah', 'major'],
      [10, 1, 'Rosh Chodesh Cheshvan', 'roshchodesh'],
      [10, 31, 'Rosh Chodesh Kislev', 'roshchodesh'],
      [11, 27, 'Chanukah 1', 'chanukah'],
      [11, 28, 'Chanukah 2', 'chanukah'],
      [11, 29, 'Chanukah 3', 'chanukah'],
      [11, 30, 'Chanukah 4', 'chanukah'],
      [12, 1, 'Chanukah 5', 'chanukah'],
      [12, 2, 'Chanukah 6', 'chanukah'],
      [12, 3, 'Chanukah 7', 'chanukah'],
      [12, 4, 'Chanukah 8', 'chanukah'],
      [12, 15, 'Asara B\'Tevet', 'fast']
    ],
    2033: [
      [1, 29, 'Rosh Chodesh Shvat', 'roshchodesh'],
      [2, 12, 'Tu BiShvat', 'minor'],
      [2, 28, 'Rosh Chodesh Adar', 'roshchodesh'],
      [3, 10, 'Ta\'anit Esther', 'fast'],
      [3, 14, 'Purim', 'optional'],
      [3, 29, 'Rosh Chodesh Nisan', 'roshchodesh'],
      [4, 14, 'Erev Pesach', 'optional'],
      [4, 15, 'Pesach I', 'major'],
      [4, 16, 'Pesach II', 'major'],
      [4, 17, 'Chol ha-Moed Pesach I', 'cholhamoed'],
      [4, 18, 'Chol ha-Moed Pesach II', 'cholhamoed'],
      [4, 19, 'Chol ha-Moed Pesach III', 'cholhamoed'],
      [4, 20, 'Chol ha-Moed Pesach IV', 'cholhamoed'],
      [4, 21, 'Pesach VII', 'major'],
      [4, 22, 'Pesach VIII', 'major'],
      [4, 27, 'Rosh Chodesh Iyar', 'roshchodesh'],
      [4, 28, 'Yom HaShoah', 'israel'],
      [5, 4, 'Yom HaZikaron', 'israel'],
      [5, 5, 'Yom HaAtzma\'ut', 'israel'],
      [5, 16, 'Lag BaOmer', 'minor'],
      [5, 27, 'Rosh Chodesh Sivan', 'roshchodesh'],
      [6, 2, 'Shavuot I', 'major'],
      [6, 3, 'Shavuot II', 'major'],
      [6, 25, 'Rosh Chodesh Tamuz', 'roshchodesh'],
      [7, 10, 'Tzom Tammuz', 'fast'],
      [7, 25, 'Rosh Chodesh Av', 'roshchodesh'],
      [8, 3, 'Tish\'a B\'Av', 'optional'],
      [8, 23, 'Rosh Chodesh Elul', 'roshchodesh'],
      [9, 25, 'Rosh Hashana I', 'major'],
      [9, 26, 'Rosh Hashana II', 'major'],
      [9, 24, 'Erev Rosh Hashana', 'optional'],
      [9, 27, 'Tzom Gedaliah', 'fast'],
      [10, 4, 'Yom Kippur', 'major'],
      [10, 3, 'Erev Yom Kippur', 'optional'],
      [10, 9, 'Sukkot I', 'major'],
      [10, 10, 'Sukkot II', 'major'],
      [10, 11, 'Chol ha-Moed Sukkot I', 'cholhamoed'],
      [10, 12, 'Chol ha-Moed Sukkot II', 'cholhamoed'],
      [10, 13, 'Chol ha-Moed Sukkot III', 'cholhamoed'],
      [10, 14, 'Chol ha-Moed Sukkot IV', 'cholhamoed'],
      [10, 15, 'Hoshana Raba', 'optional'],
      [10, 16, 'Shmini Atzeret', 'major'],
      [10, 17, 'Simchat Torah', 'major'],
      [10, 21, 'Rosh Chodesh Cheshvan', 'roshchodesh'],
      [11, 19, 'Rosh Chodesh Kislev', 'roshchodesh'],
      [12, 16, 'Chanukah 1', 'chanukah'],
      [12, 17, 'Chanukah 2', 'chanukah'],
      [12, 18, 'Chanukah 3', 'chanukah'],
      [12, 19, 'Chanukah 4', 'chanukah'],
      [12, 20, 'Chanukah 5', 'chanukah'],
      [12, 21, 'Chanukah 6', 'chanukah'],
      [12, 22, 'Chanukah 7', 'chanukah'],
      [12, 23, 'Chanukah 8', 'chanukah']
    ],
    2034: [
      [1, 3, 'Asara B\'Tevet', 'fast'],
      [1, 18, 'Rosh Chodesh Shvat', 'roshchodesh'],
      [2, 1, 'Tu BiShvat', 'minor'],
      [2, 17, 'Rosh Chodesh Adar', 'roshchodesh'],
      [2, 28, 'Ta\'anit Esther', 'fast'],
      [3, 3, 'Purim', 'optional'],
      [3, 18, 'Rosh Chodesh Nisan', 'roshchodesh'],
      [4, 3, 'Erev Pesach', 'optional'],
      [4, 4, 'Pesach I', 'major'],
      [4, 5, 'Pesach II', 'major'],
      [4, 6, 'Chol ha-Moed Pesach I', 'cholhamoed'],
      [4, 7, 'Chol ha-Moed Pesach II', 'cholhamoed'],
      [4, 8, 'Chol ha-Moed Pesach III', 'cholhamoed'],
      [4, 9, 'Chol ha-Moed Pesach IV', 'cholhamoed'],
      [4, 10, 'Pesach VII', 'major'],
      [4, 11, 'Pesach VIII', 'major'],
      [4, 17, 'Rosh Chodesh Iyar', 'roshchodesh'],
      [4, 18, 'Yom HaShoah', 'israel'],
      [4, 24, 'Yom HaZikaron', 'israel'],
      [4, 25, 'Yom HaAtzma\'ut', 'israel'],
      [5, 6, 'Lag BaOmer', 'minor'],
      [5, 16, 'Rosh Chodesh Sivan', 'roshchodesh'],
      [5, 23, 'Shavuot I', 'major'],
      [5, 24, 'Shavuot II', 'major'],
      [6, 15, 'Rosh Chodesh Tamuz', 'roshchodesh'],
      [6, 29, 'Tzom Tammuz', 'fast'],
      [7, 14, 'Rosh Chodesh Av', 'roshchodesh'],
      [7, 24, 'Tish\'a B\'Av', 'optional'],
      [8, 13, 'Rosh Chodesh Elul', 'roshchodesh'],
      [9, 13, 'Rosh Hashana I', 'major'],
      [9, 14, 'Rosh Hashana II', 'major'],
      [9, 12, 'Erev Rosh Hashana', 'optional'],
      [9, 15, 'Tzom Gedaliah', 'fast'],
      [9, 22, 'Yom Kippur', 'major'],
      [9, 21, 'Erev Yom Kippur', 'optional'],
      [9, 27, 'Sukkot I', 'major'],
      [9, 28, 'Sukkot II', 'major'],
      [9, 29, 'Chol ha-Moed Sukkot I', 'cholhamoed'],
      [9, 30, 'Chol ha-Moed Sukkot II', 'cholhamoed'],
      [10, 1, 'Chol ha-Moed Sukkot III', 'cholhamoed'],
      [10, 2, 'Chol ha-Moed Sukkot IV', 'cholhamoed'],
      [10, 3, 'Hoshana Raba', 'optional'],
      [10, 4, 'Shmini Atzeret', 'major'],
      [10, 5, 'Simchat Torah', 'major'],
      [10, 11, 'Rosh Chodesh Cheshvan', 'roshchodesh'],
      [11, 9, 'Rosh Chodesh Kislev', 'roshchodesh'],
      [12, 5, 'Chanukah 1', 'chanukah'],
      [12, 6, 'Chanukah 2', 'chanukah'],
      [12, 7, 'Chanukah 3', 'chanukah'],
      [12, 8, 'Chanukah 4', 'chanukah'],
      [12, 9, 'Chanukah 5', 'chanukah'],
      [12, 10, 'Chanukah 6', 'chanukah'],
      [12, 11, 'Chanukah 7', 'chanukah'],
      [12, 12, 'Chanukah 8', 'chanukah'],
      [12, 23, 'Asara B\'Tevet', 'fast']
    ]
  };

  // Get location from ZIP code (hardcoded common locations)
  const getLocationFromZip = (zip) => {
    const locations = {
      '02067': { lat: 42.1237, lng: -71.1787, name: 'Sharon, MA' },
      '10001': { lat: 40.7506, lng: -73.9971, name: 'New York, NY' },
      '90210': { lat: 34.0901, lng: -118.4065, name: 'Beverly Hills, CA' },
      '60614': { lat: 41.9212, lng: -87.6534, name: 'Chicago, IL' },
      '33139': { lat: 25.7825, lng: -80.1348, name: 'Miami Beach, FL' }
    };
    return locations[zip] || { lat: 42.1237, lng: -71.1787, name: 'Sharon, MA' };
  };

  // Torah portions in order
  const parshiyot = [
    'Bereshit', 'Noach', 'Lech-Lecha', 'Vayera', 'Chayei Sara', 'Toldot', 'Vayetzei', 'Vayishlach',
    'Vayeshev', 'Miketz', 'Vayigash', 'Vayechi', 'Shemot', 'Vaera', 'Bo', 'Beshalach', 'Yitro',
    'Mishpatim', 'Terumah', 'Tetzaveh', 'Ki Tisa', 'Vayakhel-Pekudei', 'Vayikra', 'Tzav',
    'Shmini', 'Tazria-Metzora', 'Achrei Mot-Kedoshim', 'Emor', 'Behar-Bechukotai',
    'Bamidbar', 'Nasso', 'Beha\'alotcha', 'Sh\'lach', 'Korach', 'Chukat-Balak', 'Pinchas',
    'Matot-Masei', 'Devarim', 'Vaetchanan', 'Eikev', 'Re\'eh', 'Shoftim', 'Ki Teitzei',
    'Ki Tavo', 'Nitzavim-Vayeilech', 'Ha\'Azinu', 'V\'Zot HaBerachah'
  ];

  // Parshah cycle starting dates (Simchat Torah)
  const parshaStartDates = {
    2024: new Date(2024, 9, 24), // Oct 24, 2024
    2025: new Date(2025, 9, 16), // Oct 16, 2025
    2026: new Date(2026, 9, 5),  // Oct 5, 2026
    2027: new Date(2027, 9, 25), // Oct 25, 2027
    2028: new Date(2028, 9, 13), // Oct 13, 2028
    2029: new Date(2029, 9, 2),  // Oct 2, 2029
    2030: new Date(2030, 9, 20), // Oct 20, 2030
    2031: new Date(2031, 9, 10), // Oct 10, 2031
    2032: new Date(2032, 9, 28), // Sep 28, 2032
    2033: new Date(2033, 9, 18), // Oct 18, 2033
    2034: new Date(2034, 9, 6)   // Oct 6, 2034
  };

  const getParshah = (saturday) => {
    const year = saturday.getFullYear();
    const startDate = parshaStartDates[year];
    
    if (!startDate || saturday < startDate) {
      const prevYear = year - 1;
      const prevStart = parshaStartDates[prevYear];
      if (prevStart) {
        const weekNum = Math.floor((saturday - prevStart) / (7 * 24 * 60 * 60 * 1000));
        return parshiyot[weekNum % parshiyot.length];
      }
      return 'Bereshit';
    }
    
    const weekNum = Math.floor((saturday - startDate) / (7 * 24 * 60 * 60 * 1000));
    return parshiyot[weekNum % parshiyot.length];
  };

  const getSpecialShabbat = (saturday, holidays) => {
    const specials = [];
    
    holidays.forEach(h => {
      const hDate = h.date;
      const daysDiff = Math.floor((hDate - saturday) / (24 * 60 * 60 * 1000));
      
      if (h.name === 'Pesach I' && daysDiff > 0 && daysDiff <= 7) {
        specials.push('Shabbat HaGadol');
      }
      if (h.name === 'Tish\'a B\'Av' && daysDiff < 0 && daysDiff >= -7) {
        specials.push('Shabbat Chazon');
      }
      if (h.name === 'Tish\'a B\'Av' && daysDiff > 0 && daysDiff <= 7) {
        specials.push('Shabbat Nachamu');
      }
    });
    
    return specials.length > 0 ? specials.join(', ') : null;
  };

  const calculateSunset = (date, lat, lng) => {
    const jDay = Math.floor((date.getTime() / 86400000) - (lng / 360)) + 2440588;
    const jCentury = (jDay - 2451545) / 36525;
    const meanLong = (280.46646 + jCentury * (36000.76983 + jCentury * 0.0003032)) % 360;
    const meanAnomaly = 357.52911 + jCentury * (35999.05029 - 0.0001537 * jCentury);
    const center = Math.sin(meanAnomaly * Math.PI / 180) * (1.914602 - jCentury * (0.004817 + 0.000014 * jCentury));
    const trueLong = meanLong + center;
    const apparentLong = trueLong - 0.00569;
    const obliquity = 23 + (26 + ((21.448 - jCentury * (46.815 + jCentury * (0.00059 - jCentury * 0.001813)))) / 60) / 60;
    const obliqCorr = obliquity + 0.00256 * Math.cos((125.04 - 1934.136 * jCentury) * Math.PI / 180);
    const declination = Math.asin(Math.sin(obliqCorr * Math.PI / 180) * Math.sin(apparentLong * Math.PI / 180)) * 180 / Math.PI;
    const hourAngle = Math.acos((Math.cos(90.833 * Math.PI / 180) / (Math.cos(lat * Math.PI / 180) * Math.cos(declination * Math.PI / 180))) - Math.tan(lat * Math.PI / 180) * Math.tan(declination * Math.PI / 180)) * 180 / Math.PI;
    const solarNoon = (720 - 4 * lng) / 1440;
    const sunsetTime = solarNoon + hourAngle * 4 / 1440;
    const isDST = (d) => {
      const jan = new Date(d.getFullYear(), 0, 1);
      const jul = new Date(d.getFullYear(), 6, 1);
      return d.getTimezoneOffset() < Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    };
    const offset = isDST(date) ? -4 : -5;
    const sunset = new Date(date);
    sunset.setHours(0, 0, 0, 0);
    sunset.setMinutes(sunsetTime * 1440 + offset * 60);
    return sunset;
  };

  const generateEvents = () => {
    setGenerating(true);
    setError(null);
    
    try {
      const allEvents = [];
      const location = getLocationFromZip(zipCode);
      const { lat, lng } = location;

      for (let year = startYear; year <= endYear; year++) {
        const yearHolidays = jewishHolidayData[year] || [];
        const holidays = yearHolidays.map(([month, day, name, type]) => ({
          date: new Date(year, month - 1, day),
          name,
          type
        }));

        // Generate Shabbat events
        let currentDate = new Date(year, 0, 1);
        while (currentDate.getDay() !== 5) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        while (currentDate.getFullYear() === year) {
          const sunset = calculateSunset(currentDate, lat, lng);
          const candleLighting = new Date(sunset.getTime() - 18 * 60000);
          const blockStart = new Date(candleLighting.getTime() - minutesBefore * 60000);
          const blockEnd = new Date(currentDate);
          blockEnd.setHours(23, 59, 0, 0);
          
          // Check if it's Chanukah
          const isChanukah = holidays.some(h => 
            h.type === 'chanukah' && 
            h.date.toDateString() === currentDate.toDateString()
          );
          const chanukahDay = isChanukah ? holidays.find(h => 
            h.type === 'chanukah' && 
            h.date.toDateString() === currentDate.toDateString()
          )?.name : null;
          
          allEvents.push({
            date: new Date(currentDate),
            start: blockStart,
            end: blockEnd,
            title: `Shabbat 🕯️`,
            type: 'busy',
            description: `Candle lighting at ${candleLighting.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}`
          });
          
          const candleTitle = isChanukah ? `🕯️🕎 Shabbat & ${chanukahDay}` : `🕯️ Candle Lighting`;
          
          allEvents.push({
            date: new Date(currentDate),
            start: candleLighting,
            end: new Date(candleLighting.getTime() + 15 * 60000),
            title: candleTitle,
            type: 'busy-false',
            description: isChanukah ? 'Shabbat and Chanukah candles' : 'Shabbat candles'
          });
          
          const saturday = new Date(currentDate);
          saturday.setDate(saturday.getDate() + 1);
          
          // Check if Saturday is Chanukah
          const isSaturdayChanukah = holidays.some(h => 
            h.type === 'chanukah' && 
            h.date.toDateString() === saturday.toDateString()
          );
          const saturdayChanukahDay = isSaturdayChanukah ? holidays.find(h => 
            h.type === 'chanukah' && 
            h.date.toDateString() === saturday.toDateString()
          )?.name : null;
          
          const parshah = getParshah(saturday);
          const specialShabbat = getSpecialShabbat(saturday, holidays);
          const parshaTitle = specialShabbat ? `📖 Parshat ${parshah} (${specialShabbat})` : `📖 Parshat ${parshah}`;
          
          const satStart = new Date(saturday);
          satStart.setHours(0, 0, 0, 0);
          const satEnd = new Date(saturday);
          satEnd.setHours(23, 59, 0, 0);
          
          allEvents.push({
            date: saturday,
            start: satStart,
            end: satEnd,
            title: parshaTitle,
            type: 'busy-false',
            description: specialShabbat || 'Weekly Torah portion'
          });
          
          const satSunset = calculateSunset(saturday, lat, lng);
          const havdalah = new Date(satSunset.getTime() + 50 * 60000);
          
          const havdalahTitle = isSaturdayChanukah ? `✨🕎 Havdalah & ${saturdayChanukahDay}` : `✨ Havdalah`;
          
          allEvents.push({
            date: saturday,
            start: havdalah,
            end: new Date(havdalah.getTime() + 15 * 60000),
            title: havdalahTitle,
            type: 'busy-false',
            description: isSaturdayChanukah ? 'Havdalah and Chanukah candles' : 'End of Shabbat'
          });
          
          currentDate.setDate(currentDate.getDate() + 7);
        }
        
        // Process holidays
        holidays.forEach(holiday => {
          const hDate = new Date(holiday.date);
          
          if (holiday.type === 'major') {
            const dayStart = new Date(hDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(hDate);
            dayEnd.setHours(23, 59, 0, 0);
            
            allEvents.push({
              date: hDate,
              start: dayStart,
              end: dayEnd,
              title: `${holiday.name} 🕍`,
              type: 'ooo',
              description: 'Jewish Holiday'
            });
            
            if (hDate.getDay() !== 6 && hDate.getDay() !== 5) {
              const sunset = calculateSunset(hDate, lat, lng);
              const candleLighting = new Date(sunset.getTime() - 18 * 60000);
              
              allEvents.push({
                date: hDate,
                start: candleLighting,
                end: new Date(candleLighting.getTime() + 15 * 60000),
                title: `🕯️ ${holiday.name}`,
                type: 'busy-false',
                description: 'Holiday candles'
              });
            }
          }
          
          if (holiday.type === 'optional') {
            const key = holiday.name.toLowerCase().replace(/[^a-z]/g, '');
            const shouldAdd = (
              (key.includes('evroshhashana') && optionalDays.erevRoshHashana) ||
              (key.includes('evyomkippur') && optionalDays.erevYomKippur) ||
              (key.includes('hoshana') && optionalDays.hoshannaRabba) ||
              (key.includes('purim') && optionalDays.purim) ||
              (key.includes('evpesach') && optionalDays.erevPesach) ||
              (key.includes('tishab') && optionalDays.tishaBAv)
            );
            
            if (shouldAdd) {
              const dayStart = new Date(hDate);
              dayStart.setHours(0, 0, 0, 0);
              const dayEnd = new Date(hDate);
              dayEnd.setHours(23, 59, 0, 0);
              
              allEvents.push({
                date: hDate,
                start: dayStart,
                end: dayEnd,
                title: `${holiday.name} 🕍`,
                type: 'ooo',
                description: 'Jewish Holiday'
              });
            } else {
              // Add as label if not OOO
              const dayStart = new Date(hDate);
              dayStart.setHours(0, 0, 0, 0);
              const dayEnd = new Date(hDate);
              dayEnd.setHours(23, 59, 0, 0);
              
              allEvents.push({
                date: hDate,
                start: dayStart,
                end: dayEnd,
                title: holiday.name,
                type: 'busy-false',
                description: 'Jewish Observance'
              });
            }
          }
          
          if (holiday.type === 'cholhamoed') {
            const shouldAdd = (
              (holiday.name.includes('Sukkot') && optionalDays.cholHamoedSukkot) ||
              (holiday.name.includes('Pesach') && optionalDays.cholHamoedPesach)
            );
            
            if (shouldAdd) {
              const dayStart = new Date(hDate);
              dayStart.setHours(0, 0, 0, 0);
              const dayEnd = new Date(hDate);
              dayEnd.setHours(23, 59, 0, 0);
              
              allEvents.push({
                date: hDate,
                start: dayStart,
                end: dayEnd,
                title: `${holiday.name} 🕍`,
                type: 'ooo',
                description: 'Jewish Holiday'
              });
            } else {
              const dayStart = new Date(hDate);
              dayStart.setHours(0, 0, 0, 0);
              const dayEnd = new Date(hDate);
              dayEnd.setHours(23, 59, 0, 0);
              
              allEvents.push({
                date: hDate,
                start: dayStart,
                end: dayEnd,
                title: holiday.name,
                type: 'busy-false',
                description: 'Jewish Observance'
              });
            }
          }
          
          if (holiday.type === 'chanukah' && hDate.getDay() !== 5) {
            const candleTime = new Date(hDate);
            candleTime.setHours(17, 30, 0, 0);
            
            allEvents.push({
              date: hDate,
              start: candleTime,
              end: new Date(candleTime.getTime() + 15 * 60000),
              title: `🕎 ${holiday.name}`,
              type: 'busy-false',
              description: 'Chanukah candles'
            });
          }
          
          // Add labels for all other types
          if (holiday.type === 'roshchodesh' || holiday.type === 'fast' || holiday.type === 'israel' || holiday.type === 'minor') {
            const dayStart = new Date(hDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(hDate);
            dayEnd.setHours(23, 59, 0, 0);
            
            allEvents.push({
              date: hDate,
              start: dayStart,
              end: dayEnd,
              title: holiday.name,
              type: 'busy-false',
              description: 'Jewish Observance'
            });
          }
        });

        // Add Sefirat HaOmer counts
        const pesach2 = holidays.find(h => h.name === 'Pesach II');
        if (pesach2) {
          for (let i = 1; i <= 49; i++) {
            const omerDate = new Date(pesach2.date);
            omerDate.setDate(omerDate.getDate() + i - 1);
            
            const dayStart = new Date(omerDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(omerDate);
            dayEnd.setHours(23, 59, 0, 0);
            
            const countTonight = i < 49 ? i + 1 : null;
            const title = countTonight 
              ? `Sefirat HaOmer Day ${i}, count ${countTonight} this evening`
              : `Sefirat HaOmer Day 49`;
            
            allEvents.push({
              date: omerDate,
              start: dayStart,
              end: dayEnd,
              title: title,
              type: 'busy-false',
              description: 'Counting of the Omer'
            });
          }
        }
      }
      
      allEvents.sort((a, b) => a.start - b.start);
      setEvents(allEvents);
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
                  <li>Creates calendar blocks for all Shabbat and Jewish holidays (2024-2034)</li>
                  <li>Blocks your calendar from before candle lighting until 11:59 PM each Friday (shows as "Busy")</li>
                  <li>Marks major holidays as "Out of Office" (Rosh Hashana, Yom Kippur, Sukkot, Pesach, Shavuot)</li>
                  <li>Adds labels for weekly Torah portions (Parshiyot), candle lighting times, Havdalah times, Rosh Chodesh, fast days, Israeli holidays, Sefirat HaOmer, and more</li>
                </ul>
                <p className="mt-3 text-xs text-yellow-800 bg-yellow-100 p-2 rounded">
                  ⚠️ <strong>Disclaimer:</strong> Holiday dates are accurate from Hebcal (2024-2034), but candle lighting times are calculated astronomically and should be verified. Always double-check times before observance.
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
                  <p className="font-semibold text-gray-800 mb-1">Outlook (Desktop):</p>
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>Download the ICS file</li>
                    <li>Open Outlook</li>
                    <li>Go to File → Open & Export → Import/Export</li>
                    <li>Select "Import an iCalendar (.ics) or vCalendar file"</li>
                    <li>Browse to your downloaded file and click "OK"</li>
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

                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                  <p className="font-semibold text-yellow-800 mb-1">💡 Pro Tip:</p>
                  <p className="text-yellow-800">Import to a separate calendar (like "Jewish Holidays") so you can easily toggle it on/off or delete all events at once if needed.</p>
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
              <label className="block text-sm text-gray-700 mb-2">ZIP Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="02067"
              />
              <p className="text-xs text-gray-500 mt-1">
                {getLocationFromZip(zipCode).name}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h2 className="font-semibold text-gray-800">Shabbat Prep Time</h2>
              </div>
              <label className="block text-sm text-gray-700 mb-2">Minutes before candle lighting time to begin setting your calendar as busy</label>
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
              <h2 className="font-semibold text-gray-800">Year Range (Secular)</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Start Year</label>
                <input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="2024"
                  max="2034"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">End Year</label>
                <input
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="2024"
                  max="2034"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-gray-800">Optional Out of Office Days</h2>
            </div>
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
              {generating ? 'Generating...' : 'Generate'}
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
                {events.length} events for {getLocationFromZip(zipCode).name}
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
