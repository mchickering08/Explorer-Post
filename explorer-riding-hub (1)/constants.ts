
import { SectionDefinition } from './types';

export const getRank = (percentage: number): string => {
  if (percentage >= 75) return "Certified";
  if (percentage >= 50) return "Advanced";
  if (percentage >= 25) return "Intermediate";
  return "Novice";
};

export const PROGRAM_OVERVIEW_TEXT = `The Explorer Post was founded so that high-school students could not only ride on the ambulance, but also practice medicine in the ambulance. It is important for the Explorers to know where each piece of equipment is on the truck, how to use each piece of equipment, and exactly why they are used. Unfortunately, many of the current riding-explorers either do not have complete knowledge of all the pieces of equipment or do not know how to use them properly.

Although this problem can be mitigated with more riding experience, the proposed Riding-Checklist plan will help ensure competency within all of the riding explorers.

The plan is for each Explorer to carry a checklist with them during their shifts. This checklist will serve as a record of their training and demonstrated competency. For each skill, the Explorer must first be taught by an Explorer Post Advisor, who will sign off that the Explorer has been properly instructed. After this, the Explorer must demonstrate the skill on two separate occasions under the supervision of two additional YPT-trained crew members. Each demonstration must be signed off by a different individual, meaning that a total of three distinct signatures are required for each skill. There is a section of “ALS Assist Skills” that the Explorer can begin checking off after all the BLS skills are completed.

A single individual may not sign off on the same skill more than once, even if the Explorer rides with them on multiple shifts. However, if the Explorer later rides with the same crew again, the other YPT-trained partner (who has not yet signed that specific skill) may sign it. This ensures that the Explorer can continue progressing while still maintaining the requirement of three unique sign-offs per skill.

At the start of each shift, the Explorer will present their checklist to the supervising crew. Any new training or sign-offs completed during the shift will be added before the end of the block, ensuring that the document remains current. To maintain a steady pace of learning and avoid overload, each Explorer may complete a maximum of TWO skill sign-offs per six-hour block. This limit includes both initial instruction and demonstrations.`;

export const TRAINING_SECTIONS: SectionDefinition[] = [
  {
    title: "Equipment & Truck Checks",
    skills: [
      { name: "Perform and complete a truck check" },
      { name: "Identify all primary bags (green O₂ bag, red ALS bag, etc.)" }
    ]
  },
  {
    title: "Patient Movement & Transport",
    skills: [
      { name: "Load and unload the empty stretcher safely" },
      { name: "Assemble and operate the stair chair" },
      { name: "Perform proper splinting and identify all splints on the truck" },
      { name: "C-Collar sizing and applying" }
    ]
  },
  {
    title: "Airway & Oxygen",
    skills: [
      { name: "Open and regulate an oxygen tank" },
      { name: "Apply a nasal cannula and a non-rebreather mask" },
      { name: "Operate and store the suction catheter" },
      { name: "Set up and operate CPAP" }
    ]
  },
  {
    title: "Monitoring & Vital Signs",
    skills: [
      { name: "Operate the monitor (blood pressure, heart rate, SpO₂)" },
      { name: "Take manual blood pressure" },
      { name: "Assess respiratory rate" },
      { name: "Perform blood glucose testing" },
      { name: "Perform a 4-lead EKG setup" },
      { name: "Glucometer (finger Stick, not Sharp)" }
    ]
  },
  {
    title: "Basic Medical Skills",
    skills: [
      { name: "Apply bandages and dressings correctly" },
      { name: "Flush an IV" },
      { name: "Operate the Lucas device" }
    ]
  },
  {
    title: "Post-Call Procedures",
    skills: [
      { name: "Clean and prepare the stretcher after a call" },
      { name: "Clean and prepare equipment for the next call" },
      { name: "Properly stow gear in the monitor after a call" },
      { name: "Stock room equipment locations" }
    ]
  },
  {
    title: "ALS Assist Skills",
    isALS: true,
    skills: [
      { name: "Perform a 12-lead EKG setup" },
      { name: "Spike a bag" }
    ]
  }
];

export const EXPLORERS_LIST = [
  "Alex Cahill",
  "Alexandra Gusinski",
  "Benjamin Sanders",
  "Catherine Broderick",
  "Gabe Froehlich",
  "Hailey Dybas",
  "John Petrotos",
  "Melanie Schwartz",
  "Neel Behringer",
  "Sloane Creech"
];

export const ADVISORS_LIST = [
  "Eirinn Rickard", "Jason Wein", "Josh Ziac", "Liz Linde", 
  "Andrew Gottshall", "Kara Schiff", "Josh Kovalsky", 
  "Mackenzie Diorio", "Scott Baxter", "Alec Sachs", 
  "Ellen Ostrander", "Jack Childs", "Eddie Graham", 
  "Dan Boudreau", "Andres Moreira", "Andy Bates", 
  "Dennis Fogler", "Pat O’Connoer", "Tracy Schietinger", "Chief Heavey"
];

export const EMPLOYEES_YPT_LIST = [
  "Karin Brion", "John McRae", "Linette Usowski", 
  "Walter Hughes", "Jack Rodican", "Frank Paolino", "Dina Scungio"
];

export const ALL_INSTRUCTORS = [...ADVISORS_LIST, ...EMPLOYEES_YPT_LIST].sort();
