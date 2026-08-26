import { HotspotInfo, GuidedExperiment, QuizQuestion } from '../types';

export const HOTSPOTS: Record<string, HotspotInfo> = {
  // Plant View Hotspots
  leaves: {
    id: 'leaves',
    name: 'Leaf Canopy',
    view: 'whole_plant',
    position: [0, 1.6, 0.4],
    title: 'The Solar Collectors of the Plant',
    description: 'Leaves are flat and thin to maximize light capture. Packed with green chlorophyll pigments in chloroplasts, they act as miniature biological solar panels.',
    role: 'Captures photons of light and absorbs CO₂ from the atmosphere while releasing oxygen gas.',
    funFact: 'A single square millimeter of a leaf contains over 500,000 chloroplasts!'
  },
  stem_xylem: {
    id: 'stem_xylem',
    name: 'Stem & Vascular Bundle (Xylem)',
    view: 'whole_plant',
    position: [0.1, 0.6, 0],
    title: 'Plant Water Pipeline',
    description: 'The stem contains Xylem tubes that pull water and minerals up from the roots to the leaves via capillary action and transpiration pull.',
    role: 'Transports H₂O from soil to the leaf cells for photolysis (water splitting).',
    funFact: 'Water can climb over 100 meters high in redwood trees purely through transpiration suction!'
  },
  roots: {
    id: 'roots',
    name: 'Root System & Soil Interface',
    view: 'whole_plant',
    position: [0, -1.0, 0],
    title: 'Water & Mineral Harvesters',
    description: 'Microscopic root hairs vastly expand surface area to draw liquid water (H₂O) and dissolved minerals from surrounding soil particles.',
    role: 'Supplies the essential H₂O molecules required to kickstart the light-dependent reactions.',
    funFact: 'Root hairs live only a few weeks and continuously regrow into fresh moist soil.'
  },
  sun_lamp: {
    id: 'sun_lamp',
    name: 'Sun / Grow Light Source',
    view: 'whole_plant',
    position: [1.8, 3.2, 1.2],
    title: 'Solar Photon Stream',
    description: 'Electromagnetic radiation packets (photons) travel from the sun or grow light to energize electrons inside photosystem protein complexes.',
    role: 'Provides the activation energy needed to split water molecules and create ATP/NADPH.',
    funFact: 'Only 1% to 2% of the sunlight hitting a leaf is actually converted into chemical energy!'
  },

  // Leaf Cross Section Hotspots
  palisade: {
    id: 'palisade',
    name: 'Palisade Mesophyll Cells',
    view: 'leaf_cross_section',
    position: [0, 0.8, 0],
    title: 'Photosynthesis Engine Room',
    description: 'Columnar cells arranged vertically right beneath the upper transparent epidermis to catch the maximum amount of direct sunlight.',
    role: 'Contains 80% of all chloroplasts in the leaf; primary site of sugar synthesis.',
    funFact: 'Chloroplasts can actively move inside palisade cells to avoid getting scorched by intense sun!'
  },
  stomata: {
    id: 'stomata',
    name: 'Stomata & Guard Cells',
    view: 'leaf_cross_section',
    position: [0.4, -0.9, 0.3],
    title: 'The Leaf Breathing Pores',
    description: 'Microscopic valves on the underside of the leaf flanked by two sausage-shaped Guard Cells that swell open with water or shrink closed during drought.',
    role: 'Regulates gas exchange: lets CO₂ in and releases O₂ + water vapor (transpiration).',
    funFact: 'Plants can open and close thousands of stomata in under 15 minutes when light levels change.'
  },
  spongy_mesophyll: {
    id: 'spongy_mesophyll',
    name: 'Spongy Mesophyll & Air Cavities',
    view: 'leaf_cross_section',
    position: [-0.6, -0.2, 0],
    title: 'Gas Diffusion Highway',
    description: 'Loosely packed, irregular cells with large interconnected air pockets that allow carbon dioxide and oxygen to rapidly diffuse throughout the leaf interior.',
    role: 'Facilitates fast gas exchange between stomata and palisade cells.',
    funFact: 'The spongy layer creates a massive internal surface area that is 30x bigger than the leaf surface.'
  },

  // Chloroplast Zoom Hotspots
  thylakoid: {
    id: 'thylakoid',
    name: 'Thylakoid Membrane & Granum',
    view: 'chloroplast_zoom',
    position: [0.5, 0.3, 0],
    title: 'Light-Dependent Reaction Station',
    description: 'Flattened sac-like disks stacked like pancakes (grana). Chlorophyll molecules embedded in this membrane absorb photons and split H₂O into O₂ + H⁺ + electrons.',
    role: 'Converts light energy into chemical batteries (ATP and NADPH) while releasing Oxygen.',
    funFact: 'The oxygen we breathe on Earth was originally split apart inside thylakoid membranes!'
  },
  stroma: {
    id: 'stroma',
    name: 'Chloroplast Stroma',
    view: 'chloroplast_zoom',
    position: [-0.6, -0.4, 0],
    title: 'Calvin Cycle (Sugar Factory)',
    description: 'Dense fluid surrounding the thylakoid stacks filled with enzymes (especially Rubisco, the most abundant protein on Earth).',
    role: 'Uses ATP + NADPH to fix CO₂ into Glucose sugar ($C₆H₁₂O₆$) without needing direct light.',
    funFact: 'Rubisco enzyme can fix about 3 carbon dioxide molecules every single second per molecule.'
  }
};

export const GUIDED_EXPERIMENTS: GuidedExperiment[] = [
  {
    id: 'spectrum_test',
    title: '1. The Spectrum Secret',
    category: 'Light Physics',
    question: 'Why are leaves green? Which light color produces the lowest photosynthesis rate?',
    goal: 'Switch the light spectrum to Green light (520nm) and observe how the rate plummets compared to Red or Blue light.',
    hint: 'Use the Light Spectrum selector to choose "Green Light" and watch the rate gauge.',
    targetCondition: (state, output) => state.lightSpectrum === 'green' && output.rate < 25 && state.lightIntensity > 50,
    explanation: 'Chlorophyll pigments reflect green wavelengths (which is why plants appear green to our eyes!) while absorbing blue (~430nm) and red (~660nm) photons with high efficiency.',
    badge: 'Spectral Master 🌈'
  },
  {
    id: 'drought_stomata',
    title: '2. The Thirsty Guard Cells',
    category: 'Water Regulation',
    question: 'What happens to stomata and photosynthesis during a drought?',
    goal: 'Drop the Water Level to under 15% and switch to the Leaf Cross-Section view to see the guard cells clamp shut.',
    hint: 'Slide Water down to 10% or less and zoom into the Leaf Cross-Section view.',
    targetCondition: (state, output) => state.waterLevel <= 15 && output.stomataOpen <= 10,
    explanation: 'When water is scarce, guard cells lose turgor pressure and close the stomata pores. This saves the plant from dehydrating, but cuts off the CO₂ supply, stopping photosynthesis!',
    badge: 'Drought Detective 💧'
  },
  {
    id: 'temp_sweetspot',
    title: '3. The Enzyme Temperature Sweetspot',
    category: 'Enzyme Kinetics',
    question: 'Why does photosynthesis collapse at 45°C even with bright light and plenty of water?',
    goal: 'Heat the chamber past 44°C to trigger thermal enzyme denaturation (Rubisco breakdown).',
    hint: 'Slide Temperature all the way up to 45°C or higher with high light.',
    targetCondition: (state, output) => state.temperature >= 44 && output.rate < 30 && state.lightIntensity > 50,
    explanation: 'Like egg whites cooking in a pan, key photosynthetic enzymes (especially Rubisco) denature (lose their 3D protein shape) at high temperatures, completely stopping chemical reactions.',
    badge: 'Thermal Biologist 🌡️'
  },
  {
    id: 'max_yield',
    title: '4. The Ultimate Greenhouse Yield',
    category: 'Optimization',
    question: 'Can you calibrate all 4 variables to achieve peak photosynthesis (>90%)?',
    goal: 'Tune Light (>80%, White/Blue/Red), CO₂ (>700 ppm), Water (>60%), and Temperature (24-28°C) simultaneously.',
    hint: 'Keep temperature around 25-27°C, boost CO2 and Light, and give plenty of water.',
    targetCondition: (_state, output) => output.rate >= 90,
    explanation: 'According to Liebig’s Law of the Minimum, photosynthesis only runs at top speed when ALL limiting factors are satisfied simultaneously!',
    badge: 'Greenhouse Grandmaster 🏆'
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Which raw ingredient provides the oxygen atoms that are released as O₂ gas into our atmosphere?',
    options: [
      'Carbon Dioxide (CO₂)',
      'Water (H₂O)',
      'Glucose (C₆H₁₂O₆)',
      'Soil Minerals'
    ],
    correctIndex: 1,
    explanation: 'During the Light-Dependent reactions in the thylakoid, water molecules (H₂O) are split apart (photolysis) by light energy into hydrogen ions, electrons, and O₂ gas.',
    relatedStructure: 'thylakoid'
  },
  {
    id: 2,
    question: 'Why do most plant leaves appear bright green under white sunlight?',
    options: [
      'Chlorophyll absorbs green light better than any other color',
      'Chlorophyll reflects and transmits green light while absorbing blue and red',
      'Green light has more energetic photons than blue light',
      'Stomata emit green fluorescence during gas exchange'
    ],
    correctIndex: 1,
    explanation: 'Chlorophyll a and b pigments absorb blue (430-450 nm) and red (650-680 nm) light, but reflect green wavelengths (~520-550 nm), making leaves appear green to our eyes.',
    relatedStructure: 'leaves'
  },
  {
    id: 3,
    question: 'What is the primary role of the microscopic stomata pores on the underside of a leaf?',
    options: [
      'To absorb liquid water directly from rain drops',
      'To take in carbon dioxide (CO₂) and release oxygen (O₂) and water vapor',
      'To anchor the palisade cells to the stem',
      'To reflect excess ultraviolet light'
    ],
    correctIndex: 1,
    explanation: 'Stomata are gas exchange valves regulated by two guard cells. When swollen with water, they open to let CO₂ diffuse in for the Calvin cycle, and release O₂.',
    relatedStructure: 'stomata'
  },
  {
    id: 4,
    question: 'Where inside the chloroplast does the Calvin Cycle (Sugar synthesis) take place?',
    options: [
      'Inside the Thylakoid lumen',
      'In the fluid Stroma',
      'On the outer membrane wall',
      'Inside the root xylem'
    ],
    correctIndex: 1,
    explanation: 'The Calvin cycle takes place in the fluid Stroma of the chloroplast, where enzymes like Rubisco combine CO₂ with ATP and NADPH to form Glucose sugar.',
    relatedStructure: 'stroma'
  },
  {
    id: 5,
    question: 'If a plant has 100% full sunlight, 25°C temperature, and 100% water, but CO₂ is only 50 ppm, what is the limiting factor?',
    options: [
      'Light Intensity',
      'Carbon Dioxide (CO₂)',
      'Water Supply',
      'Temperature'
    ],
    correctIndex: 1,
    explanation: 'Liebig’s Law of the Minimum states that the rate of photosynthesis is capped by whichever essential input is in shortest supply—in this case, CO₂.',
    relatedStructure: 'spongy_mesophyll'
  },
  {
    id: 6,
    question: 'Why does photosynthesis rate drop to near zero when the temperature rises above 45°C (113°F)?',
    options: [
      'Photons of light cannot penetrate hot air',
      'Enzymes like Rubisco denature and lose their 3D functional shape',
      'Water freezes inside the xylem vessels',
      'Chlorophyll turns into starch'
    ],
    correctIndex: 1,
    explanation: 'Photosynthetic enzymes are proteins folded into precise 3D shapes. Extreme heat breaks the bonds holding their structure (denaturation), destroying their catalytic function.',
    relatedStructure: 'palisade'
  }
];
