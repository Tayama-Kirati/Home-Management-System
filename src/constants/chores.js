import { P } from './palette';

export const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
export const WEEKEND = ["Saturday","Sunday"];

export const CATEGORIES = [
  { id:"Kitchen",  icon:"🍽️", color:P.blue },
  { id:"Cleaning", icon:"🧽", color:P.teal },
  { id:"Laundry",  icon:"🧺", color:P.purple },
  { id:"Cooking",  icon:"🍳", color:P.amber },
  { id:"Outdoor",  icon:"🌿", color:P.success },
  { id:"Pets",     icon:"🐾", color:"#b45309" },
  { id:"Errands",  icon:"🛍️", color:"#be185d" },
  { id:"Tidying",  icon:"🧸", color:"#0369a1" },
];
export const catOf = id => CATEGORIES.find(c=>c.id===id) || { id, icon:"🧹", color:P.muted };

export const FREQUENCIES = ["Daily","Weekly","Bi-weekly","Monthly"];

export const TIME_SLOTS = [
  { id:"Morning",   icon:"🌅" },
  { id:"Afternoon", icon:"☀️" },
  { id:"Evening",   icon:"🌙" },
  { id:"Anytime",   icon:"🕒" },
];
export const slotOf = id => TIME_SLOTS.find(s=>s.id===id) || TIME_SLOTS[3];

export const EFFORT = { 1:"Light", 2:"Medium", 3:"Heavy" };

// Starter chores; minAge is a sensible default the family can change.
export const CHORE_TEMPLATES = [
  { name:"Wash dishes",            category:"Kitchen",  effort:2, minutes:20, minAge:8,  frequency:"Daily",  days:DAYS },
  { name:"Set & clear the table",  category:"Kitchen",  effort:1, minutes:10, minAge:4,  frequency:"Daily",  days:DAYS },
  { name:"Wipe kitchen counters",  category:"Kitchen",  effort:1, minutes:10, minAge:7,  frequency:"Daily",  days:DAYS },
  { name:"Cook dinner",            category:"Cooking",  effort:3, minutes:60, minAge:14, frequency:"Daily",  days:DAYS },
  { name:"Pack school lunches",    category:"Cooking",  effort:1, minutes:15, minAge:10, frequency:"Weekly", days:["Monday","Tuesday","Wednesday","Thursday","Friday"] },
  { name:"Sweep floors",           category:"Cleaning", effort:1, minutes:15, minAge:6,  frequency:"Daily",  days:DAYS },
  { name:"Mop floors",             category:"Cleaning", effort:2, minutes:30, minAge:10, frequency:"Weekly", days:["Saturday"] },
  { name:"Clean bathroom",         category:"Cleaning", effort:3, minutes:40, minAge:12, frequency:"Weekly", days:["Saturday"] },
  { name:"Dust furniture",         category:"Cleaning", effort:1, minutes:20, minAge:6,  frequency:"Weekly", days:["Wednesday"] },
  { name:"Clean puja room",        category:"Cleaning", effort:1, minutes:15, minAge:8,  frequency:"Weekly", days:["Friday"] },
  { name:"Take out trash",         category:"Cleaning", effort:1, minutes:5,  minAge:8,  frequency:"Weekly", days:["Monday","Thursday"] },
  { name:"Do laundry",             category:"Laundry",  effort:2, minutes:45, minAge:12, frequency:"Weekly", days:["Wednesday","Sunday"] },
  { name:"Fold & put away clothes",category:"Laundry",  effort:1, minutes:20, minAge:6,  frequency:"Weekly", days:["Wednesday","Sunday"] },
  { name:"Iron clothes",           category:"Laundry",  effort:2, minutes:30, minAge:14, frequency:"Weekly", days:["Sunday"] },
  { name:"Water plants",           category:"Outdoor",  effort:1, minutes:10, minAge:5,  frequency:"Daily",  days:DAYS },
  { name:"Clean courtyard / roof", category:"Outdoor",  effort:2, minutes:30, minAge:10, frequency:"Weekly", days:["Saturday"] },
  { name:"Feed pets",              category:"Pets",     effort:1, minutes:10, minAge:5,  frequency:"Daily",  days:DAYS },
  { name:"Walk the dog",           category:"Pets",     effort:2, minutes:30, minAge:10, frequency:"Daily",  days:DAYS },
  { name:"Grocery shopping",       category:"Errands",  effort:2, minutes:60, minAge:16, frequency:"Weekly", days:["Saturday"] },
  { name:"Refill drinking water",  category:"Errands",  effort:1, minutes:10, minAge:10, frequency:"Weekly", days:["Tuesday","Friday"] },
  { name:"Make beds",              category:"Tidying",  effort:1, minutes:5,  minAge:4,  frequency:"Daily",  days:DAYS },
  { name:"Tidy living room",       category:"Tidying",  effort:1, minutes:15, minAge:5,  frequency:"Daily",  days:DAYS },
];

// Routines reference template chores by name; they're resolved to ids when loaded.
export const ROUTINE_TEMPLATES = [
  { name:"Morning Routine",      icon:"🌅", timeOfDay:"Morning",   days:DAYS, choreNames:["Make beds","Water plants","Feed pets","Sweep floors"] },
  { name:"After-Dinner Cleanup", icon:"🍽️", timeOfDay:"Evening",   days:DAYS, choreNames:["Set & clear the table","Wash dishes","Wipe kitchen counters"] },
  { name:"Weekend Deep Clean",   icon:"🧽", timeOfDay:"Morning",   days:["Saturday"], choreNames:["Mop floors","Clean bathroom","Clean courtyard / roof","Dust furniture"] },
  { name:"Laundry Day",          icon:"🧺", timeOfDay:"Afternoon", days:["Sunday"], choreNames:["Do laundry","Fold & put away clothes","Iron clothes"] },
];

// How much of a "full share" of chores someone can reasonably take on, by age.
export const ageCapacity = age => {
  if (age==null || age==="") return 1;
  const a = Number(age);
  if (a < 6)  return 0.3;
  if (a < 10) return 0.5;
  if (a < 14) return 0.75;
  if (a < 18) return 0.9;
  if (a < 65) return 1;
  return 0.7;
};
