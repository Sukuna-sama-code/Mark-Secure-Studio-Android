export interface DefaultImageItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Nature' | 'Architecture' | 'Art & Abstract' | 'Urban & Street' | 'Technology';
  badge: string;
  url: string;
  thumbUrl: string;
  resolution: string;
  description: string;
}

export interface Default4kItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Landscape 4K' | 'Urban 4K' | 'Macro 4K' | 'Space 4K' | 'Architecture 4K';
  badge: string;
  url: string;
  thumbUrl: string;
  resolution: string;
  description: string;
}

// Curated list of 100 Diverse Web Images (Unsplash high-speed CDN)
const IMAGE_SAMPLE_SEEDS = [
  // Nature & Wildlife (20)
  { id: 'img-nat-01', title: 'Misty Alpine Pine Ridge', category: 'Nature', pid: '1426604966848-d7adac402bff', desc: 'Dense coniferous canopy with morning mountain fog for fine-gradient watermark testing.' },
  { id: 'img-nat-02', title: 'Icelandic Black Sand Coast', category: 'Nature', pid: '1507525428034-b723cf961d3e', desc: 'High-contrast Atlantic surf crashing against basalt sand formations.' },
  { id: 'img-nat-03', title: 'Emerald Rainforest Cascade', category: 'Nature', pid: '1448375240586-882707db888b', desc: 'Silky multi-tier waterfall veiled by ancient temperate moss.' },
  { id: 'img-nat-04', title: 'Dolomite Jagged Peaks', category: 'Nature', pid: '1464822759023-fed622ff2c3b', desc: 'Sunset alpenglow illuminating limestone crests against crystal skies.' },
  { id: 'img-nat-05', title: 'Sahara Dune Crests', category: 'Nature', pid: '1509316975850-ff9c5deb0cd9', desc: 'Wind-sculpted golden sand ridges with dramatic shadow geometry.' },
  { id: 'img-nat-06', title: 'Lofoten Arctic Fjord', category: 'Nature', pid: '1506744038136-46273834b3fb', desc: 'Glacial water reflections beneath towering snow-dusted Scandinavian cliffs.' },
  { id: 'img-nat-07', title: 'Autumn Birch Sanctuary', category: 'Nature', pid: '1441974231531-c6227db76b6e', desc: 'Sunlight filtering through amber birch leaves in prime autumn foliage.' },
  { id: 'img-nat-08', title: 'Lavender Valensole Plateau', category: 'Nature', pid: '1499002238440-d264edd596ce', desc: 'Geometric purple rows meeting sunrise horizon in Provence.' },
  { id: 'img-nat-09', title: 'Pacific Wave Crest Barrel', category: 'Nature', pid: '1502680390469-be75c86b636f', desc: 'Translucent turquoise barrel wave with micro water-droplet spray.' },
  { id: 'img-nat-10', title: 'Grand Canyon Red Strata', category: 'Nature', pid: '1474044159687-1ee9f3a51722', desc: 'Centuries of sedimentary rock layers under expansive desert sky.' },
  { id: 'img-nat-11', title: 'Kyoto Bamboo Grove', category: 'Nature', pid: '1493976040374-85c8e12f0c0e', desc: 'Vertical towering stalks creating natural green lines for stego verification.' },
  { id: 'img-nat-12', title: 'Glacial Ice Cave Azure', category: 'Nature', pid: '1483921020237-2ff51e8e4b22', desc: 'Vibrant deep-blue compressed ice tunnel with radiant translucence.' },
  { id: 'img-nat-13', title: 'Serengeti Cheetah Lookout', category: 'Nature', pid: '1517849845537-4d257902454a', desc: 'Sharp predator portrait against golden savannah grasses.' },
  { id: 'img-nat-14', title: 'Snowy Owl Frost Horizon', category: 'Nature', pid: '1518709268805-4e9042af9f23', desc: 'Detailed plumage texture and intense golden eyes on tundra.' },
  { id: 'img-nat-15', title: 'Redwood Giant Trunks', category: 'Nature', pid: '1444703686981-a3abbc4d4fe3', desc: 'Colossal Sequoia roots anchored in damp coastal soil.' },
  { id: 'img-nat-16', title: 'Yosemite Valley Mist', category: 'Nature', pid: '1426604966848-d7adac402bff', desc: 'El Capitan granite rising through soft valley fog banks.' },
  { id: 'img-nat-17', title: 'Volcanic Caldera Lake', category: 'Nature', pid: '1469474968028-56623f02e42e', desc: 'Cerulean mineral water nestled inside dark crater rim.' },
  { id: 'img-nat-18', title: 'Norwegian Aurora Borealis', category: 'Nature', pid: '1531366936337-7c912a4589a7', desc: 'Vibrant green solar ribbon dancing across starlit arctic sky.' },
  { id: 'img-nat-19', title: 'Namibian Sossusvlei Dead Vlei', category: 'Nature', pid: '1509316975850-ff9c5deb0cd9', desc: 'Centuries-old camel thorn trees contrasting against orange dunes.' },
  { id: 'img-nat-20', title: 'Emerald Moss Forest River', category: 'Nature', pid: '1511497584788-87676104235f', desc: 'Clear stream carving through boulders coated in ancient velvet moss.' },

  // Architecture (20)
  { id: 'img-arc-01', title: 'Brutalist Concrete Curve', category: 'Architecture', pid: '1513694203232-719a280e022f', desc: 'Monolithic concrete sweeping curve bathed in sharp afternoon sunlight.' },
  { id: 'img-arc-02', title: 'Spiral Bauhaus Staircase', category: 'Architecture', pid: '1513694203232-719a280e022f', desc: 'Hypnotic geometric spiral looking down from tenth floor landing.' },
  { id: 'img-arc-03', title: 'Glass Facade Reflections', category: 'Architecture', pid: '1486406146926-c627a92ad1ab', desc: 'Modern skyscraper grid reflecting cloud formations and sunset hues.' },
  { id: 'img-arc-04', title: 'Gothic Cathedral Vault', category: 'Architecture', pid: '1548625361-195fe868170d', desc: 'Intricate stone ribbed vaults and rose window light rays.' },
  { id: 'img-arc-05', title: 'Nordic Timber Pavilion', category: 'Architecture', pid: '1512917774080-9991f1c4c750', desc: 'Minimalist sustainable pine frame blending into birch landscape.' },
  { id: 'img-arc-06', title: 'Futuristic Airport Canopy', category: 'Architecture', pid: '1519999482648-25049ddd37b1', desc: 'Parametric steel lattice canopy engineered for natural airflow.' },
  { id: 'img-arc-07', title: 'Valencia Arts Pavilion', category: 'Architecture', pid: '1506157786151-b8491531f063', desc: 'Calatrava-inspired organic white skeleton structure over mirror pool.' },
  { id: 'img-arc-08', title: 'Traditional Japanese Pagoda', category: 'Architecture', pid: '1493976040374-85c8e12f0c0e', desc: 'Five-story vermillion wooden eaves nestled in autumn maples.' },
  { id: 'img-arc-09', title: 'Santorini Whitewashed Domes', category: 'Architecture', pid: '1570077188670-e3a8d69ac5ff', desc: 'Cycladic cubist houses with cobalt domes overlooking the caldera.' },
  { id: 'img-arc-10', title: 'Geometric Ceramic Atrium', category: 'Architecture', pid: '1507089947368-19c1da9775ae', desc: 'Moroccan zellij tilework patterns lining an open-air palatial court.' },
  { id: 'img-arc-11', title: 'Industrial Steel Suspension Bridge', category: 'Architecture', pid: '1477959858617-67f30bc75b82', desc: 'Interlocking steel trusses and massive cable anchors.' },
  { id: 'img-arc-12', title: 'Concrete Brutalist Balconies', category: 'Architecture', pid: '1487958449943-2429e8be8625', desc: 'Repetitive modular terraces casting stark diagonal shadows.' },
  { id: 'img-arc-13', title: 'Modernist Museum Cantilever', category: 'Architecture', pid: '1492691527719-9d1e07e534b4', desc: 'Gravity-defying black steel cantilever extending over courtyard.' },
  { id: 'img-arc-14', title: 'Ancient Roman Aqueduct Arches', category: 'Architecture', pid: '1552832230-c0197dd311b5', desc: 'Massive weathered stone arches spanning sunlit Spanish valley.' },
  { id: 'img-arc-15', title: 'Minimalist Interior Loft', category: 'Architecture', pid: '1518481612222-68bbe828eee1', desc: 'Polished micro-cement floors and floor-to-ceiling glass paneling.' },
  { id: 'img-arc-16', title: 'Steel Dome Observatory', category: 'Architecture', pid: '1506703719100-a0f3a48c0f86', desc: 'Stellar observatory slotted dome open toward the Milky Way core.' },
  { id: 'img-arc-17', title: 'Timber Lattice Ceiling', category: 'Architecture', pid: '1505691938895-1758d7feb511', desc: 'Japanese joinery timber ceiling woven without nails or fasteners.' },
  { id: 'img-arc-18', title: 'Canyon Residence Overhang', category: 'Architecture', pid: '1600585154340-be6161a56a0c', desc: 'Mid-century glass pavilion perched on sandstone canyon bluff.' },
  { id: 'img-arc-19', title: 'Bespoke Spiral Library Stacks', category: 'Architecture', pid: '1521587760476-6c12a4b040da', desc: 'Curved walnut bookshelves ascending four stories around skylight.' },
  { id: 'img-arc-20', title: 'Urban Metro Station Vault', category: 'Architecture', pid: '1519501025264-65ba15a82390', desc: 'Reflective stainless steel subway tunnels with neon transit guide lines.' },

  // Art & Abstract (20)
  { id: 'img-art-01', title: 'Prismatic Fluid Marble', category: 'Art & Abstract', pid: '1541701494587-cb58502866ab', desc: 'Swirling rainbow acrylic pigment suspensions creating macro marbling.' },
  { id: 'img-art-02', title: 'Obsidian Liquid Waves', category: 'Art & Abstract', pid: '1618005182384-a83a8bd57fbe', desc: 'Viscous chrome metallic ripples reflecting soft atmospheric ambient.' },
  { id: 'img-art-03', title: 'Golden Foil Flakes on Slate', category: 'Art & Abstract', pid: '1579783900882-c0d3dad7b119', desc: '24K gold leaf gilding over textured raw charcoal paper.' },
  { id: 'img-art-04', title: 'Geometric Kinetic Cubes', category: 'Art & Abstract', pid: '1550684848-fac1c5b4e853', desc: 'Matte 3D voxel cubes casting soft ambient occlusion shadows.' },
  { id: 'img-art-05', title: 'Holographic Gradient Mesh', category: 'Art & Abstract', pid: '1550745165-9bc0b252726f', desc: 'Bioluminescent cyan, magenta, and amber chromatic gradient.' },
  { id: 'img-art-06', title: 'Watercolor Granulation Bloom', category: 'Art & Abstract', pid: '1579783902614-a3fb3927b675', desc: 'Natural pigment settling into heavy cold-press cotton fibers.' },
  { id: 'img-art-07', title: 'Neon Laser Diffraction', category: 'Art & Abstract', pid: '1509198397868-475647b2a1e5', desc: 'High-frequency photon interference fringes across prism lens.' },
  { id: 'img-art-08', title: 'Minimalist Charcoal Texture', category: 'Art & Abstract', pid: '1518709766631-a6a7f45921c3', desc: 'Raw grain and tactile fibers on handmade washi paper.' },
  { id: 'img-art-09', title: 'Vibrant Acrylic Impasto', category: 'Art & Abstract', pid: '1579783923665-35632ff4010c', desc: 'Thick palette-knife oil strokes with expressive specular crests.' },
  { id: 'img-art-10', title: 'Cyanotype Sun Print Botanical', category: 'Art & Abstract', pid: '1460661419201-fd4cecdf8a8b', desc: 'Deep Prussian blue photographic exposure of delicate fern leaves.' },
  { id: 'img-art-11', title: 'Smoke Tendrils in Obsidian', category: 'Art & Abstract', pid: '1528459801416-a9e53bbf4e17', desc: 'Whispering curls of incense smoke frozen against pure black.' },
  { id: 'img-art-12', title: 'Topographic Contour Lines', category: 'Art & Abstract', pid: '1524661135-423995f22d0b', desc: 'Laser-etched elevation contours on dark matte composite.' },
  { id: 'img-art-13', title: 'Crystal Geode Amethyst Macro', category: 'Art & Abstract', pid: '1518709268805-4e9042af9f23', desc: 'Fractured purple mineral facets refracting internal spectral rays.' },
  { id: 'img-art-14', title: 'Oil Slick Thin Film Rainbow', category: 'Art & Abstract', pid: '1550751827-4bd374c3f58b', desc: 'Newton rings and iridescent interference colors on dark water.' },
  { id: 'img-art-15', title: 'Minimal Bauhaus Composition', category: 'Art & Abstract', pid: '1579783900882-c0d3dad7b119', desc: 'Primary color circle and rectangular planes in golden ratio balance.' },
  { id: 'img-art-16', title: 'Molten Glass Blowpipe Orb', category: 'Art & Abstract', pid: '1518709766631-a6a7f45921c3', desc: 'Glowing honey-orange molten silica cooling in studio tongs.' },
  { id: 'img-art-17', title: 'Deep Ocean Bioluminescence', category: 'Art & Abstract', pid: '1534447677768-be436bb09401', desc: 'Phosphorescent plankton trails sparkling in moonlit breakers.' },
  { id: 'img-art-18', title: 'Copper Verdigris Patina', category: 'Art & Abstract', pid: '1563089145-599997674d42', desc: 'Centuries of turquoise oxidation on beaten architectural bronze.' },
  { id: 'img-art-19', title: 'Polarized Light Stress Pattern', category: 'Art & Abstract', pid: '1550745165-9bc0b252726f', desc: 'Birefringent rainbow stress bands mapped across acrylic geometry.' },
  { id: 'img-art-20', title: 'Ferrofluid Magnetic Spikes', category: 'Art & Abstract', pid: '1618005182384-a83a8bd57fbe', desc: 'Neodymium magnetic field sculpturing liquid iron into crown peaks.' },

  // Urban & Street (20)
  { id: 'img-urb-01', title: 'Tokyo Shinjuku Rainy Crossing', category: 'Urban & Street', pid: '1503899036084-c55cdd92da26', desc: 'Neon shop signs reflecting across wet asphalt in heavy Tokyo rain.' },
  { id: 'img-urb-02', title: 'Hong Kong Neon Alleyway', category: 'Urban & Street', pid: '1514565131-fce0801e5785', desc: 'Glowing overhead cantilevered acrylic signs framing narrow street.' },
  { id: 'img-urb-03', title: 'New York Manhattan Golden Hour', category: 'Urban & Street', pid: '1480714378408-67cf0d13bc1b', desc: 'Sunlight streaming down 5th Avenue canyon during Manhattanhenge.' },
  { id: 'img-urb-04', title: 'London Victoria Station Commute', category: 'Urban & Street', pid: '1513635269975-59663e0ac1ad', desc: 'Motion blur of commuter silhouettes beneath historic iron train sheds.' },
  { id: 'img-urb-05', title: 'Seoul Gangnam Night Boulevard', category: 'Urban & Street', pid: '1538485399081-7191377e8241', desc: 'Streaking vehicle light trails between digital billboard skyscrapers.' },
  { id: 'img-urb-06', title: 'Amsterdam Canal Bicycle Twilight', category: 'Urban & Street', pid: '1512470876302-972faa2aa9a4', desc: 'Vintage cruiser bike locked to cast iron railing over quiet canal.' },
  { id: 'img-urb-07', title: 'Paris Montmartre Cobblestone', category: 'Urban & Street', pid: '1502602898657-3e91760cbb34', desc: 'Steep stone stairway framed by classic zinc rooftops and bistros.' },
  { id: 'img-urb-08', title: 'Berlin Kreuzberg Subway Platform', category: 'Urban & Street', pid: '1519501025264-65ba15a82390', desc: 'Yellow U-Bahn train arriving at tiled mid-century subterranean station.' },
  { id: 'img-urb-09', title: 'Chicago Loop Elevated Tracks', category: 'Urban & Street', pid: '1477959858617-67f30bc75b82', desc: 'Heavy riveted steel trestle casting rhythmic shadows across street.' },
  { id: 'img-urb-10', title: 'Singapore Marina Bay Skyline', category: 'Urban & Street', pid: '1525625293386-3f8f99389edd', desc: 'Illuminated Supertrees and bay waters under tropical purple dusk.' },
  { id: 'img-urb-11', title: 'Copenhagen Nyhavn Waterfront', category: 'Urban & Street', pid: '1513622470522-26c3c8a854bc', desc: 'Brightly colored 17th-century townhouses and wooden sailing hulls.' },
  { id: 'img-urb-12', title: 'Kyoto Pontocho Lantern Lane', category: 'Urban & Street', pid: '1493976040374-85c8e12f0c0e', desc: 'Soft paper lantern glow warming narrow flagstone dining alley.' },
  { id: 'img-urb-13', title: 'Barcelona Eixample Octagon Blocks', category: 'Urban & Street', pid: '1583422409516-2895a776dedb', desc: 'Cerda grid aerial showing iconic chamfered corners and courtyards.' },
  { id: 'img-urb-14', title: 'Venice Grand Canal Gondola', category: 'Urban & Street', pid: '1514890547357-a9ee288728e0', desc: 'Hand-carved gondola prow moored in turquoise tidal current.' },
  { id: 'img-urb-15', title: 'Stockholm Gamla Stan Ochre Alley', category: 'Urban & Street', pid: '1509356843151-3e7d96241e11', desc: 'Warm saffron building facades framing narrow cobblestone passage.' },
  { id: 'img-urb-16', title: 'San Francisco Cable Car Incline', category: 'Urban & Street', pid: '1506146332389-18140dc7b2fb', desc: 'Historic wooden tram climbing steep Nob Hill track towards bay.' },
  { id: 'img-urb-17', title: 'Dubai Downtown Towering Spires', category: 'Urban & Street', pid: '1512453979798-5ea266f8880c', desc: 'Gleaming glass pinnacles rising above early morning sea fog.' },
  { id: 'img-urb-18', title: 'Lisbon Alfama Tram 28 Curve', category: 'Urban & Street', pid: '1504280390367-361c6d9f38f4', desc: 'Classic yellow streetcar squealing around tight azulejo-tiled corner.' },
  { id: 'img-urb-19', title: 'Melbourne Laneway Street Art', category: 'Urban & Street', pid: '1514565131-fce0801e5785', desc: 'Vibrant mural layered with stencil graffiti and cafe tables.' },
  { id: 'img-urb-20', title: 'Taipei Shilin Night Market Vapors', category: 'Urban & Street', pid: '1503899036084-c55cdd92da26', desc: 'Steam billowing from food stalls under glowing yellow canopies.' },

  // Technology & Industry (20)
  { id: 'img-tec-01', title: 'Silicon Microchip Die Macro', category: 'Technology', pid: '1518770660439-4636190af475', desc: 'Gold bond wires connecting 3nm photolithography circuit gates.' },
  { id: 'img-tec-02', title: 'Quantum Computing Cryo Chamber', category: 'Technology', pid: '1563089145-599997674d42', desc: 'Gilded dilution refrigerator chandelier with gold RF coaxial loops.' },
  { id: 'img-tec-03', title: 'Server Datacenter LED Corridor', category: 'Technology', pid: '1558494949-ef010cbdcc31', desc: 'Pulsing emerald and amber status LEDs down cold-aisle containment.' },
  { id: 'img-tec-04', title: 'Spacecraft Thermal Shield Tiles', category: 'Technology', pid: '1517976487504-59a1a3177dd3', desc: 'Black borosilicate ceramic tiles engineered for orbital re-entry heat.' },
  { id: 'img-tec-05', title: 'Robotic Welding Arm Sparks', category: 'Technology', pid: '1581091226825-a6a2a5aee158', desc: 'Precision industrial kuka arm welding chassis with bright orange sparks.' },
  { id: 'img-tec-06', title: 'Fiber Optic Laser Bundle', category: 'Technology', pid: '1544197150-b99a580bb7a8', desc: 'End-glowing glass strands carrying terabit photon streams.' },
  { id: 'img-tec-07', title: 'PCB Surface Mount Solder Joints', category: 'Technology', pid: '1518770660439-4636190af475', desc: 'Reflowed tin-silver solder pads and surface mount micro-capacitors.' },
  { id: 'img-tec-08', title: 'Aircraft Jet Turbine Titanium Blades', category: 'Technology', pid: '1508614589041-895b88991e3e', desc: 'Swept titanium alloy fan blades engineered for high-bypass thrust.' },
  { id: 'img-tec-09', title: 'Supercomputer Liquid Cooling Tubes', category: 'Technology', pid: '1550751827-4bd374c3f58b', desc: 'Fluorescent UV reactive coolant circulating through copper heatsinks.' },
  { id: 'img-tec-10', title: 'Automated Telescope Mirror Array', category: 'Technology', pid: '1506703719100-a0f3a48c0f86', desc: 'Hexagonal gold-coated beryllium segments aligned with nanometer sensors.' },
  { id: 'img-tec-11', title: 'Cleanroom Wafer Fab Inspection', category: 'Technology', pid: '1581092160607-ee22621dd758', desc: 'Technician in bunny suit examining 300mm silicon ingot under UV lamp.' },
  { id: 'img-tec-12', title: 'High-Voltage Tesla Coil Discharge', category: 'Technology', pid: '1509198397868-475647b2a1e5', desc: 'Branching violet plasma arcs grounding onto Faraday cage mesh.' },
  { id: 'img-tec-13', title: 'Carbon Fiber Weave Texture', category: 'Technology', pid: '1550684848-fac1c5b4e853', desc: 'Twilled 3K carbon composite showing resin sheen and geometric weave.' },
  { id: 'img-tec-14', title: 'CNC Billet Milling Cutter', category: 'Technology', pid: '1581091226825-a6a2a5aee158', desc: 'Carbide endmill cutting aircraft aluminum under cooling lubricant jet.' },
  { id: 'img-tec-15', title: 'Wind Turbine Generator Nacelle', category: 'Technology', pid: '1466611653911-95081537e5b7', desc: 'Giant rotor hub perched 120 meters above rolling offshore swells.' },
  { id: 'img-tec-16', title: 'Fusion Reactor Tokamak Chamber', category: 'Technology', pid: '1563089145-599997674d42', desc: 'Toroidal magnetic containment coils ready for hydrogen plasma pulse.' },
  { id: 'img-tec-17', title: 'Surgical Robotic Arms Interface', category: 'Technology', pid: '1516549655169-df83a0774514', desc: 'Micro-manipulator instruments with sub-millimeter tremor filtering.' },
  { id: 'img-tec-18', title: 'Solar Photovoltaic Cell Array', category: 'Technology', pid: '1509391365360-2e959784a276', desc: 'Deep blue monocrystalline silicon wafers capturing high-noon sun.' },
  { id: 'img-tec-19', title: 'Lithium Battery Electrode Slurry', category: 'Technology', pid: '1518770660439-4636190af475', desc: 'Calendered cathode film coating with uniform micro-porous structure.' },
  { id: 'img-tec-20', title: 'Holographic Heads-Up Display Lens', category: 'Technology', pid: '1550745165-9bc0b252726f', desc: 'Augmented reality waveguide displaying vector telemetry overlay.' },
];

// Curated list of 100 Ultra-High-Definition 4K Photographic Samples
const PHOTO_4K_SEEDS = [
  // Landscape 4K (20)
  { id: '4k-lnd-01', title: '4K Matterhorn Alpine Dawn', category: 'Landscape 4K', pid: '1464822759023-fed622ff2c3b', desc: '3840x2160 ultra-sharp peak reflecting in Stelli lake with zero digital compression.' },
  { id: '4k-lnd-02', title: '4K Banff Moraine Turquoise Waters', category: 'Landscape 4K', pid: '1506744038136-46273834b3fb', desc: 'Valley of the Ten Peaks towering over glacial rock-flour fed turquoise lake.' },
  { id: '4k-lnd-03', title: '4K Grand Teton Valley Reflections', category: 'Landscape 4K', pid: '1426604966848-d7adac402bff', desc: 'Snake River Oxbow bend mirroring granite cathedral crags at sunrise.' },
  { id: '4k-lnd-04', title: '4K Torres del Paine Horns', category: 'Landscape 4K', pid: '1517849845537-4d257902454a', desc: 'Patagonian granite spires swept by 70-knot wind clouds.' },
  { id: '4k-lnd-05', title: '4K Monument Valley Monoliths', category: 'Landscape 4K', pid: '1474044159687-1ee9f3a51722', desc: 'Navajo sandstone buttes rising 300 meters above red desert floor.' },
  { id: '4k-lnd-06', title: '4K Milford Sound Fiord Cliff', category: 'Landscape 4K', pid: '1507525428034-b723cf961d3e', desc: 'Rainforest cascades plummeting 1,000 meters directly into ocean fjord.' },
  { id: '4k-lnd-07', title: '4K Antelope Canyon Light Beam', category: 'Landscape 4K', pid: '1509316975850-ff9c5deb0cd9', desc: 'Shaft of noon sunlight piercing slot canyon dust particles.' },
  { id: '4k-lnd-08', title: '4K Mount Fuji Cherry Blossom Frame', category: 'Landscape 4K', pid: '1493976040374-85c8e12f0c0e', desc: 'Perfect snow cone framed by spring sakura petals across Lake Kawaguchi.' },
  { id: '4k-lnd-09', title: '4K Yosemite Valley Tunnel View', category: 'Landscape 4K', pid: '1444703686981-a3abbc4d4fe3', desc: 'El Capitan, Half Dome, and Bridalveil Fall in legendary Sierra balance.' },
  { id: '4k-lnd-10', title: '4K Plitvice Lakes Emerald Tier', category: 'Landscape 4K', pid: '1448375240586-882707db888b', desc: 'Travertine limestone dams creating sixteen terraced turquoise pools.' },
  { id: '4k-lnd-11', title: '4K Seljalandsfoss Behind the Falls', category: 'Landscape 4K', pid: '1483921020237-2ff51e8e4b22', desc: 'Looking through thundering 60-meter water curtain into sunset skies.' },
  { id: '4k-lnd-12', title: '4K Scottish Highlands Glen Coe', category: 'Landscape 4K', pid: '1469474968028-56623f02e42e', desc: 'Atmospheric heather moorlands and volcanic valleys shrouded in mist.' },
  { id: '4k-lnd-13', title: '4K Oregon Crater Lake Indigo', category: 'Landscape 4K', pid: '1534447677768-be436bb09401', desc: 'Pure caldera water holding deepest natural blue on North American continent.' },
  { id: '4k-lnd-14', title: '4K Mount Rainier Wildflower Meadow', category: 'Landscape 4K', pid: '1441974231531-c6227db76b6e', desc: 'Lupine and paintbrush flowers carpeted before glacial volcanic dome.' },
  { id: '4k-lnd-15', title: '4K Bryce Canyon Hoodoo Amphitheater', category: 'Landscape 4K', pid: '1511497584788-87676104235f', desc: 'Thousands of red, orange, and white limestone spire formations.' },
  { id: '4k-lnd-16', title: '4K Norwegian Geiranger Fjord', category: 'Landscape 4K', pid: '1531366936337-7c912a4589a7', desc: 'Seven Sisters waterfall descending into deep UNESCO ocean sound.' },
  { id: '4k-lnd-17', title: '4K Kauai Na Pali Coastline Ridges', category: 'Landscape 4K', pid: '1502680390469-be75c86b636f', desc: 'Razor-sharp emerald sea cliffs rising 1,200 meters from Pacific ocean.' },
  { id: '4k-lnd-18', title: '4K Salar de Uyuni Salt Mirror', category: 'Landscape 4K', pid: '1518709766631-a6a7f45921c3', desc: 'Thousand-mile salt flats coated in rain reflecting sky into infinity.' },
  { id: '4k-lnd-19', title: '4K Redwood National Park Mist', category: 'Landscape 4K', pid: '1499002238440-d264edd596ce', desc: 'Sunbeams radiating through Pacific marine layer onto 300-foot canopies.' },
  { id: '4k-lnd-20', title: '4K Lake Baikal Transparent Ice', category: 'Landscape 4K', pid: '1483921020237-2ff51e8e4b22', desc: 'Crystal clear frozen freshwater showing methane bubble pillars beneath.' },

  // Urban 4K (20)
  { id: '4k-urb-01', title: '4K Shinjuku Tokyo Metropolis Night', category: 'Urban 4K', pid: '1503899036084-c55cdd92da26', desc: 'Ultra-resolution cityscape with millions of windows and fiber neon signs.' },
  { id: '4k-urb-02', title: '4K Manhattan Mid-Town Grid', category: 'Urban 4K', pid: '1480714378408-67cf0d13bc1b', desc: 'Aerial panorama from Empire State looking north to Central Park.' },
  { id: '4k-urb-03', title: '4K Hong Kong Victoria Harbour Twilight', category: 'Urban 4K', pid: '1514565131-fce0801e5785', desc: 'Star Ferry crossing illuminated harbor backed by 300 illuminated skyscrapers.' },
  { id: '4k-urb-04', title: '4K London Tower Bridge Blue Hour', category: 'Urban 4K', pid: '1513635269975-59663e0ac1ad', desc: 'Historic bascule towers illuminated over long exposure Thames current.' },
  { id: '4k-urb-05', title: '4K Singapore Marina Bay Sands SkyPark', category: 'Urban 4K', pid: '1525625293386-3f8f99389edd', desc: 'World-renowned cantilever infinity pool overlooking financial core.' },
  { id: '4k-urb-06', title: '4K Chicago River Architectural Canyon', category: 'Urban 4K', pid: '1477959858617-67f30bc75b82', desc: 'Wrigley Building and Marina City towers reflected in jade water.' },
  { id: '4k-urb-07', title: '4K Paris Eiffel Tower From Trocadero', category: 'Urban 4K', pid: '1502602898657-3e91760cbb34', desc: 'Wrought-iron lattice engineering rising above manicured gardens.' },
  { id: '4k-urb-08', title: '4K Dubai Marina Superyacht Basin', category: 'Urban 4K', pid: '1512453979798-5ea266f8880c', desc: 'Twisted Cayan Tower and waterfront luxury promenade at dusk.' },
  { id: '4k-urb-09', title: '4K San Francisco Bay Bridge Lights', category: 'Urban 4K', pid: '1506146332389-18140dc7b2fb', desc: 'Leo Villareal algorithmic LED light sculpture dancing on suspension cables.' },
  { id: '4k-urb-10', title: '4K Seoul Namsan Tower Panorama', category: 'Urban 4K', pid: '1538485399081-7191377e8241', desc: 'Sprawling high-density capital valley glowing with orange road arteries.' },
  { id: '4k-urb-11', title: '4K Amsterdam Herengracht Canal Mansions', category: 'Urban 4K', pid: '1512470876302-972faa2aa9a4', desc: 'Gilded age stepped-gable facades with warm interior chandeliers.' },
  { id: '4k-urb-12', title: '4K Sydney Opera House Sails', category: 'Urban 4K', pid: '1523482580672-f109ba8cb9be', desc: 'Precast concrete ribs clad in one million Swedish ceramic tiles.' },
  { id: '4k-urb-13', title: '4K Barcelona Sagrada Familia Facade', category: 'Urban 4K', pid: '1583422409516-2895a776dedb', desc: 'Gaudí biological stonework and nativity portals in morning sun.' },
  { id: '4k-urb-14', title: '4K Rome Colosseum Flavian Amphitheatre', category: 'Urban 4K', pid: '1552832230-c0197dd311b5', desc: 'Travertine stone arches that once held fifty thousand spectators.' },
  { id: '4k-urb-15', title: '4K Kyoto Gion Ochaya Street', category: 'Urban 4K', pid: '1493976040374-85c8e12f0c0e', desc: 'Traditional dark cedar lattice facades and stone rain drainage gutters.' },
  { id: '4k-urb-16', title: '4K Berlin Brandenburg Gate Night', category: 'Urban 4K', pid: '1519501025264-65ba15a82390', desc: 'Neoclassical sandstone triumphal arch lit under deep Prussian blue.' },
  { id: '4k-urb-17', title: '4K Venice Santa Maria della Salute', category: 'Urban 4K', pid: '1514890547357-a9ee288728e0', desc: 'Baroque octagonal dome anchored in water at entrance to Grand Canal.' },
  { id: '4k-urb-18', title: '4K Lisbon Miradouro Santa Luzia', category: 'Urban 4K', pid: '1504280390367-361c6d9f38f4', desc: 'Bougainvillea pergola looking over terracotta rooftops to Tagus estuary.' },
  { id: '4k-urb-19', title: '4K Taipei 101 Pagoda Skyscraper', category: 'Urban 4K', pid: '1503899036084-c55cdd92da26', desc: 'Slanted bamboo box modules designed to withstand typhoon winds.' },
  { id: '4k-urb-20', title: '4K Stockholm City Hall Waterfront', category: 'Urban 4K', pid: '1509356843151-3e7d96241e11', desc: 'National romantic red brick tower topped with Three Golden Crowns.' },

  // Macro 4K (20)
  { id: '4k-mac-01', title: '4K Monarch Butterfly Wing Scales', category: 'Macro 4K', pid: '1550745165-9bc0b252726f', desc: 'Chitin micro-tile shingles displaying vibrant orange photonic iridescence.' },
  { id: '4k-mac-02', title: '4K Morning Dew on Spider Web', category: 'Macro 4K', pid: '1518709268805-4e9042af9f23', desc: 'Tens of spherical water lenses refracting green morning garden background.' },
  { id: '4k-mac-03', title: '4K Hummingbird Throat Feathers', category: 'Macro 4K', pid: '1541701494587-cb58502866ab', desc: 'Barbs refracting ruby red and emerald green structural color.' },
  { id: '4k-mac-04', title: '4K Hexagonal Snowflake Crystal', category: 'Macro 4K', pid: '1483921020237-2ff51e8e4b22', desc: 'Stellar dendrite crystal showing microscopic molecular symmetry.' },
  { id: '4k-mac-05', title: '4K Mechanical Watch Escapement Wheel', category: 'Macro 4K', pid: '1518770660439-4636190af475', desc: 'Polished ruby jewel bearings and balance spring oscillating at 28,800 vph.' },
  { id: '4k-mac-06', title: '4K Dandelion Seed Parachute', category: 'Macro 4K', pid: '1518709766631-a6a7f45921c3', desc: 'Feathery pappus filaments carrying single seed on gentle breeze.' },
  { id: '4k-mac-07', title: '4K Honeycomb Wax Geometry', category: 'Macro 4K', pid: '1579783900882-c0d3dad7b119', desc: 'Golden beeswax cells filled with translucent raw clover honey.' },
  { id: '4k-mac-08', title: '4K Dragonfly Compound Eye Facets', category: 'Macro 4K', pid: '1550684848-fac1c5b4e853', desc: 'Thirty thousand individual ommatidia lenses mapped across convex sphere.' },
  { id: '4k-mac-09', title: '4K Chameleon Iris Spectrum', category: 'Macro 4K', pid: '1618005182384-a83a8bd57fbe', desc: 'Turret eye with scaled eyelid and ring of iridescent chromatophores.' },
  { id: '4k-mac-10', title: '4K Water Drop Surface Tension Splash', category: 'Macro 4K', pid: '1502680390469-be75c86b636f', desc: 'High-speed corona crown splash frozen at 1/10,000th of a second.' },
  { id: '4k-mac-11', title: '4K Fern Fiddlehead Unfurling', category: 'Macro 4K', pid: '1460661419201-fd4cecdf8a8b', desc: 'Golden ratio spiral of young frond covered in soft protective down.' },
  { id: '4k-mac-12', title: '4K Peacock Tail Eye Feather', category: 'Macro 4K', pid: '1541701494587-cb58502866ab', desc: 'Concentric turquoise and bronze melanin rods producing metallic shine.' },
  { id: '4k-mac-13', title: '4K Silicon Microprocessor Die 3nm', category: 'Macro 4K', pid: '1518770660439-4636190af475', desc: 'Extremely detailed logic blocks etched with extreme ultraviolet light.' },
  { id: '4k-mac-14', title: '4K Damascus Steel Forging Layers', category: 'Macro 4K', pid: '1563089145-599997674d42', desc: 'Wootz steel blade etched to reveal centuries-old flowing water patterns.' },
  { id: '4k-mac-15', title: '4K Orchid Flower Stigma Pollen', category: 'Macro 4K', pid: '1579783923665-35632ff4010c', desc: 'Microscopic pollinia grains perched on velvety magenta petals.' },
  { id: '4k-mac-16', title: '4K Chameleon Scales Color Shift', category: 'Macro 4K', pid: '1550745165-9bc0b252726f', desc: 'Guanine crystal lattice tuning wavelength between turquoise and lime.' },
  { id: '4k-mac-17', title: '4K Roasted Coffee Bean Crevices', category: 'Macro 4K', pid: '1511497584788-87676104235f', desc: 'Dark espresso roast with glistening natural oils along central fissure.' },
  { id: '4k-mac-18', title: '4K Sea Urchin Shell Spine Nodes', category: 'Macro 4K', pid: '1507525428034-b723cf961d3e', desc: 'Five-fold radial calcite stereom structure showing natural porous lattice.' },
  { id: '4k-mac-19', title: '4K Fountain Pen Gold Nib Tines', category: 'Macro 4K', pid: '1579783900882-c0d3dad7b119', desc: '18K hand-ground iridium tipping with royal blue ink capillary slit.' },
  { id: '4k-mac-20', title: '4K Roman Intaglio Carnelian Gem', category: 'Macro 4K', pid: '1552832230-c0197dd311b5', desc: 'Sub-millimeter carving of Minerva engraved into semi-precious quartz.' },

  // Space 4K (20)
  { id: '4k-spc-01', title: '4K Pillars of Creation Eagle Nebula', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Hubble & Webb composite of interstellar gas columns forming baby stars.' },
  { id: '4k-spc-02', title: '4K Andromeda Galaxy M31 Disk', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'One trillion stars orbiting supermassive black hole 2.5 million light years out.' },
  { id: '4k-spc-03', title: '4K Solar Corona Eclipse Flare', category: 'Space 4K', pid: '1531366936337-7c912a4589a7', desc: 'Diamond ring effect with solar prominences looping across black moon disk.' },
  { id: '4k-spc-04', title: '4K Orion Nebula Stellar Nursery', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Cavity carved in molecular cloud by ultraviolet blast of Trapezium cluster.' },
  { id: '4k-spc-05', title: '4K Earth Terminus Line from Orbit', category: 'Space 4K', pid: '1446776811953-b23d57bd21aa', desc: 'Day meeting night with golden atmosphere rim glowing over Mediterranean.' },
  { id: '4k-spc-06', title: '4K Lunar Tycho Crater Ejecta Rays', category: 'Space 4K', pid: '1532693322450-2cb5c511067d', desc: 'Impact craters and basalt maria with crisp shadows across moon limb.' },
  { id: '4k-spc-07', title: '4K Saturn Rings Shadow on Clouds', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Cassini division and ring shadows striped over amber hydrogen storms.' },
  { id: '4k-spc-08', title: '4K Carina Nebula Cosmic Cliffs', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Towering gaseous peaks eroded by intense stellar radiation in infrared.' },
  { id: '4k-spc-09', title: '4K Milky Way Galactic Core Arch', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Sagittarius star clouds and dark dust lanes rising over desert horizon.' },
  { id: '4k-spc-10', title: '4K Mars Olympus Mons Volcano', category: 'Space 4K', pid: '1509316975850-ff9c5deb0cd9', desc: 'Solar system highest shield volcano rising 21 km above rust plains.' },
  { id: '4k-spc-11', title: '4K Crab Nebula Supernova Remnant', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Expanding filaments of exploded star with spinning pulsar engine at heart.' },
  { id: '4k-spc-12', title: '4K Veil Nebula Supernova Shockwave', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Delicate ionized oxygen and hydrogen threads rippling across Cygnus.' },
  { id: '4k-spc-13', title: '4K Ring Nebula M57 Barrel', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Dying white dwarf star shedding outer shell in glowing rainbow smoke ring.' },
  { id: '4k-spc-14', title: '4K Jupiter Great Red Spot Storm', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Anticyclonic storm larger than Earth churning with reddish-orange eddies.' },
  { id: '4k-spc-15', title: '4K Whirlpool Galaxy M51 Spiral Arms', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Grand-design spiral arms undergoing starburst from companion galaxy.' },
  { id: '4k-spc-16', title: '4K Tarantula Nebula 30 Doradus', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Largest known stellar factory containing massive stars 250 times sun.' },
  { id: '4k-spc-17', title: '4K Southern Ring Nebula Double Star', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Webb infrared imagery resolving orbiting binary stars inside dust shells.' },
  { id: '4k-spc-18', title: '4K Sombrero Galaxy M104 Dark Rim', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Thick dust lane encircling brilliant central bulge of elliptical galaxy.' },
  { id: '4k-spc-19', title: '4K Helix Nebula Eye of God', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Provisional planetary nebula displaying cometary knots pointing at center.' },
  { id: '4k-spc-20', title: '4K Deep Field Galaxy Cluster Lens', category: 'Space 4K', pid: '1506703719100-a0f3a48c0f86', desc: 'Gravitational lensing stretching primordial galaxies into curved arcs.' },

  // Architecture 4K (20)
  { id: '4k-arc-01', title: '4K Louvre Glass Pyramid Twilight', category: 'Architecture 4K', pid: '1502602898657-3e91760cbb34', desc: 'I.M. Pei glass polyhedron glowing above Napoleon courtyard reflecting pool.' },
  { id: '4k-arc-02', title: '4K Sydney Harbor Bridge Steelwork', category: 'Architecture 4K', pid: '1523482580672-f109ba8cb9be', desc: 'Massive steel arch span showing individual rivets and harbor waves.' },
  { id: '4k-arc-03', title: '4K Taj Mahal White Marble Inlay', category: 'Architecture 4K', pid: '1564507592333-c60657eea523', desc: 'Pietra dura floral inlays with jasper and jade on translucent Makrana marble.' },
  { id: '4k-arc-04', title: '4K Guggenheim Bilbao Titanium Curves', category: 'Architecture 4K', pid: '1506157786151-b8491531f063', desc: 'Frank Gehry organic titanium panels catching golden reflections off Nervion.' },
  { id: '4k-arc-05', title: '4K Pantheum Rome Coffered Dome', category: 'Architecture 4K', pid: '1552832230-c0197dd311b5', desc: 'Unreinforced concrete oculus casting sharp nine-meter sunlight spotlight.' },
  { id: '4k-arc-06', title: '4K Fallingwater Cantilever over Stream', category: 'Architecture 4K', pid: '1600585154340-be6161a56a0c', desc: 'Frank Lloyd Wright masterpiece integrated directly into Bear Run waterfall.' },
  { id: '4k-arc-07', title: '4K Golden Gate Bridge Cable Strands', category: 'Architecture 4K', pid: '1506146332389-18140dc7b2fb', desc: 'International orange towers rising 227 meters above Pacific tidal fog.' },
  { id: '4k-arc-08', title: '4K Florence Cathedral Brunelleschi Dome', category: 'Architecture 4K', pid: '1514890547357-a9ee288728e0', desc: 'Double-walled terracotta herringbone brickwork crowning Tuscan skyline.' },
  { id: '4k-arc-09', title: '4K Chrysler Building Art Deco Crown', category: 'Architecture 4K', pid: '1480714378408-67cf0d13bc1b', desc: 'Nirosta stainless steel sunburst spire with eagle gargoyles.' },
  { id: '4k-arc-10', title: '4K Alhambra Court of the Lions', category: 'Architecture 4K', pid: '1507089947368-19c1da9775ae', desc: '124 white marble columns supporting stalactite stucco arches.' },
  { id: '4k-arc-11', title: '4K Shard London Glass Pinnacle', category: 'Architecture 4K', pid: '1513635269975-59663e0ac1ad', desc: 'Renzo Piano pyramid composed of 11,000 glass panes towering over London.' },
  { id: '4k-arc-12', title: '4K St. Peters Basilica Bernini Colonnade', category: 'Architecture 4K', pid: '1552832230-c0197dd311b5', desc: 'Four rows of Doric columns embracing Vatican square in travertine grandeur.' },
  { id: '4k-arc-13', title: '4K Parthenon Pentelic Marble Columns', category: 'Architecture 4K', pid: '1552832230-c0197dd311b5', desc: 'Doric peristyle on Acropolis rock with subtle entasis curvature.' },
  { id: '4k-arc-14', title: '4K Sydney Opera House Concrete Ribs', category: 'Architecture 4K', pid: '1523482580672-f109ba8cb9be', desc: 'Precast concrete arches supporting interlocking self-cleaning tile shells.' },
  { id: '4k-arc-15', title: '4K Elbphilharmonie Hamburg Wave Glass', category: 'Architecture 4K', pid: '1519501025264-65ba15a82390', desc: 'Curved glass facade mimicking river waves perched atop historic brick warehouse.' },
  { id: '4k-arc-16', title: '4K Forbidden City Vermilion Halls', category: 'Architecture 4K', pid: '1493976040374-85c8e12f0c0e', desc: 'Yellow glazed roof tiles and vermilion colonnades along meridian axis.' },
  { id: '4k-arc-17', title: '4K Neuschwanstein Castle Bavarian Mist', category: 'Architecture 4K', pid: '1464822759023-fed622ff2c3b', desc: 'Limestone fairytale towers perched atop rugged Alpine gorge.' },
  { id: '4k-arc-18', title: '4K Petra Al-Khazneh Treasury Rock Facade', category: 'Architecture 4K', pid: '1509316975850-ff9c5deb0cd9', desc: 'Hand-carved Hellenistic facade glowing inside sandstone Siq canyon.' },
  { id: '4k-arc-19', title: '4K Flatiron Building Wedge Prow', category: 'Architecture 4K', pid: '1480714378408-67cf0d13bc1b', desc: 'Beaux-Arts limestone prow slicing between Broadway and Fifth Avenue.' },
  { id: '4k-arc-20', title: '4K Millau Viaduct Cable-Stayed Pylons', category: 'Architecture 4K', pid: '1477959858617-67f30bc75b82', desc: 'Highest bridge pylons on Earth spanning the Tarn river valley above clouds.' },
];

export const DEFAULT_IMAGE_SAMPLES: DefaultImageItem[] = IMAGE_SAMPLE_SEEDS.map((s) => ({
  id: s.id,
  title: s.title,
  subtitle: s.category,
  category: s.category as any,
  badge: s.category,
  thumbUrl: `https://images.unsplash.com/photo-${s.pid}?auto=format&fit=crop&w=480&h=300&q=70`,
  url: `https://images.unsplash.com/photo-${s.pid}?auto=format&fit=crop&w=1600&q=80`,
  resolution: '1600 × 1067',
  description: s.desc,
}));

export const DEFAULT_4K_SAMPLES: Default4kItem[] = PHOTO_4K_SEEDS.map((s) => ({
  id: s.id,
  title: s.title,
  subtitle: s.category,
  category: s.category as any,
  badge: '4K UHD',
  thumbUrl: `https://images.unsplash.com/photo-${s.pid}?auto=format&fit=crop&w=480&h=300&q=70`,
  url: `https://images.unsplash.com/photo-${s.pid}?auto=format&fit=crop&w=3840&q=85`,
  resolution: '3840 × 2160',
  description: s.desc,
}));
