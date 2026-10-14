import { today, addDays } from './helpers';
import { DAYS } from '../constants/chores';
import { todayLocal, shiftMonths } from './dates';

export const SEED_USERS = [
  { id:"u1", name:"Aarav Sharma", email:"aarav@family.com", password:"1234", avatar:"AS", role:"Parent" },
  { id:"u2", name:"Priya Sharma", email:"priya@family.com", password:"1234", avatar:"PS", role:"Parent" },
  { id:"u3", name:"Riya Sharma",  email:"riya@family.com",  password:"1234", avatar:"RS", role:"Child" },
];

export const SEED_CONNECTIONS = [
  { id:"c1", from:"u1", to:"u2", status:"accepted" },
];

export const INITIAL_SHARED_DATA = {
  tasks:[
    {id:"t1",text:"Buy groceries",done:false,priority:"High",due:today(),assignedTo:"u1",createdBy:"u1",createdByName:"Aarav Sharma"},
    {id:"t2",text:"Pay electricity bill",done:false,priority:"High",due:today(),assignedTo:"u2",createdBy:"u2",createdByName:"Priya Sharma"},
    {id:"t3",text:"Riya's school fees",done:true,priority:"Medium",due:addDays(today(),-2),assignedTo:"u1",createdBy:"u1",createdByName:"Aarav Sharma"},
  ],
  events:[
    {id:"e1",title:"Tihar celebration",date:addDays(today(),7),time:"06:00",type:"Event",notes:"",createdBy:"u1",createdByName:"Aarav"},
    {id:"e2",title:"Doctor appointment",date:addDays(today(),3),time:"10:30",type:"Medical",notes:"",createdBy:"u2",createdByName:"Priya"},
  ],
  chores:[],
  choreLibrary:[
    {id:"cl1",name:"Wash dishes",category:"Kitchen",effort:2,minutes:20,minAge:8,frequency:"Daily",days:DAYS,timeOfDay:"Evening",active:true},
    {id:"cl2",name:"Set & clear the table",category:"Kitchen",effort:1,minutes:10,minAge:4,frequency:"Daily",days:DAYS,timeOfDay:"Evening",active:true},
    {id:"cl3",name:"Cook dinner",category:"Cooking",effort:3,minutes:60,minAge:14,frequency:"Daily",days:DAYS,timeOfDay:"Evening",active:true},
    {id:"cl4",name:"Sweep floors",category:"Cleaning",effort:1,minutes:15,minAge:6,frequency:"Daily",days:DAYS,timeOfDay:"Morning",active:true},
    {id:"cl5",name:"Mop floors",category:"Cleaning",effort:2,minutes:30,minAge:10,frequency:"Weekly",days:["Saturday"],timeOfDay:"Morning",active:true},
    {id:"cl6",name:"Clean bathroom",category:"Cleaning",effort:3,minutes:40,minAge:12,frequency:"Weekly",days:["Saturday"],timeOfDay:"Morning",active:true},
    {id:"cl7",name:"Water plants",category:"Outdoor",effort:1,minutes:10,minAge:5,frequency:"Daily",days:DAYS,timeOfDay:"Morning",active:true},
    {id:"cl8",name:"Do laundry",category:"Laundry",effort:2,minutes:45,minAge:12,frequency:"Weekly",days:["Wednesday","Sunday"],timeOfDay:"Afternoon",active:true},
    {id:"cl9",name:"Grocery shopping",category:"Errands",effort:2,minutes:60,minAge:16,frequency:"Weekly",days:["Saturday"],timeOfDay:"Afternoon",active:true},
    {id:"cl10",name:"Take out trash",category:"Cleaning",effort:1,minutes:5,minAge:8,frequency:"Weekly",days:["Monday","Thursday"],timeOfDay:"Morning",active:true},
  ],
  choreRoutines:[
    {id:"cr1",name:"After-Dinner Cleanup",icon:"🍽️",timeOfDay:"Evening",days:DAYS,choreIds:["cl2","cl1"],ownerId:"",active:true},
    {id:"cr2",name:"Weekend Deep Clean",icon:"🧽",timeOfDay:"Morning",days:["Saturday"],choreIds:["cl5","cl6"],ownerId:"",active:true},
  ],
  choreProfiles:{
    u1:{age:45,likes:["Outdoor","Errands"],dislikes:["Laundry"]},
    u2:{age:42,likes:["Cooking"],dislikes:[]},
    u3:{age:12,likes:["Outdoor","Pets"],dislikes:["Cleaning"],availableDays:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],maxMinutesPerDay:40},
  },
  choreExtraMembers:[],
  contacts:[
    {id:"co1",name:"Dr. Poudel",phone:"+977-9841234567",category:"Medical",notes:"Family doctor",addedBy:"Aarav"},
    {id:"co2",name:"Hari Electrician",phone:"+977-9851234567",category:"Service",notes:"",addedBy:"Priya"},
  ],
  bills:[
    {id:"b1",type:"Electricity",amount:1850,dueDate:addDays(today(),5),paidDate:null,period:"May 2026",addedBy:"Aarav"},
    {id:"b2",type:"Waste Management",amount:300,dueDate:addDays(today(),10),paidDate:null,period:"May 2026",addedBy:"Priya"},
    {id:"b3",type:"Electricity",amount:1620,dueDate:addDays(today(),-30),paidDate:addDays(today(),-28),period:"Apr 2026",addedBy:"Aarav"},
  ],
  groceryItems:[
    {id:"g1",name:"Rice (5kg)",price:650,qty:1,date:today(),category:"Staples",addedBy:"Priya"},
    {id:"g2",name:"Milk (1L)",price:100,qty:4,date:today(),category:"Dairy",addedBy:"Priya"},
    {id:"g3",name:"Lentils",price:200,qty:2,date:addDays(today(),-32),category:"Staples",addedBy:"Priya"},
  ],
  gasRecs:[
    {id:"gas1",start:addDays(today(),-35),end:addDays(today(),-5),kg:14.2,cost:2200,addedBy:"Aarav"},
    {id:"gas2",start:addDays(today(),-5),end:null,kg:14.2,cost:2200,addedBy:"Aarav"},
  ],
  medicines:[
    {id:"m1",name:"Vitamin D",dosage:"1 tablet",frequency:"Daily",assignedTo:"u1",startDate:today(),endDate:"",notes:"After breakfast",stock:28,taken:[],addedBy:"Priya"},
  ],
  maintenance:[
    {id:"mn1",name:"AC Servicing",category:"HVAC",intervalDays:90,lastDate:addDays(today(),-80),nextDate:addDays(today(),10),cost:1500,notes:"",addedBy:"Aarav",history:[]},
    {id:"mn2",name:"Pest Control",category:"Pest",intervalDays:180,lastDate:addDays(today(),-20),nextDate:addDays(today(),160),cost:2000,notes:"",addedBy:"Aarav",history:[]},
  ],
  waterLogs:[
    {id:"w1",date:today(),level:"75",liters:50,cost:0,notes:"",loggedBy:"Aarav"},
  ],
  savings:[
    {id:"s1",name:"Dashain Fund",target:50000,saved:18000,deadline:addDays(today(),60),category:"Festival",notes:"",addedBy:"Aarav",history:[]},
  ],
  budgets:[],
  monthlyIncome:150000,
  loans:[
    {id:"ln1",name:"Home loan",type:"Home",lender:"Nabil Bank",principal:3500000,rate:10.5,tenure:180,startDate:shiftMonths(todayLocal(),-23),emi:38689,borrower:"u1",notes:"",addedBy:"Aarav",
      payments:Array.from({length:23},(_,i)=>({id:"lp"+i,date:shiftMonths(todayLocal(),-23+i),amount:38689,kind:"emi",by:"Aarav"}))},
    {id:"ln2",name:"Scooter EMI",type:"Vehicle",lender:"Hamro Finance",principal:240000,rate:13,tenure:24,startDate:shiftMonths(todayLocal(),-9),emi:11410,borrower:"u2",notes:"",addedBy:"Priya",
      payments:Array.from({length:8},(_,i)=>({id:"sp"+i,date:shiftMonths(todayLocal(),-9+i),amount:11410,kind:"emi",by:"Priya"}))},
  ],
  appTitle:"KiratiKhim",
  medicalRecords:[],
  gasPhotos:[],
  waterPhotos:[],
  maintenancePhotos:[],
  feed:[
    {user:"Aarav",action:"added task 'Buy groceries'",time:"9:30 AM"},
    {user:"Priya",action:"marked electricity bill as paid",time:"Yesterday"},
  ],
  tankSize:1000,
};

export const INITIAL_BLANK_DATA = {
  tasks:[],events:[],chores:[],choreLibrary:[],choreRoutines:[],choreProfiles:{},choreExtraMembers:[],contacts:[],bills:[],groceryItems:[],
  gasRecs:[],medicines:[],maintenance:[],waterLogs:[],savings:[],budgets:[],loans:[],monthlyIncome:"",
  appTitle:"KiratiKhim",medicalRecords:[],gasPhotos:[],waterPhotos:[],
  maintenancePhotos:[],feed:[],tankSize:1000,members:[],connections:[],
};
