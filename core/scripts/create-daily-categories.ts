import { prisma } from "../lib/prisma";
import {
  generateAllCategories,
  PropertyMap,
  ValueMaps,
  NameMap
} from "./category-generator";

// Name mappings: Maps value labels to category name constituents (ex. Male -> "Male", Singer -> "Singer from")
const nameMap: NameMap = {
  Male: "Male",
  Female: "Female",
  singer: "Singer from",
  politician: "Politician from",
  actor: "Actor from",
  scientist: "Scientist from",
  director: "Director from",
  writer: "Writer from",
  Canada: "Canada",
  United_States: "United States",
  United_Kingdom: "United Kingdom",
  Japan: "Japan",
  Korea: "Korea",
  Australia: "Australia",
  song: "Song Genre: ",
  rock: "Rock",
  pop: "Pop",
  jazz: "Jazz",
  classical: "Classical",
  electronic: "Electronic",
  country: "Country",
  hip_hop: "Hip Hop",
  film: "Movies directed by ",
  joss_whedon: "Joss Whedon",
  george_lucas: "George Lucas",
  christopher_nolan: "Christopher Nolan",
  quentin_tarantino: "Quentin Tarantino",
  david_lynch: "David Lynch",
  martin_scorsese: "Martin Scorsese",
  alfred_hitchcock: "Alfred Hitchcock",
  steven_spielberg: "Steven Spielberg",
  ridley_scott: "Ridley Scott",
  robert_zemeckis: "Robert Zemeckis",
  james_cameron: "James Cameron",
  toronto_raptors: "Toronto Raptors Players",
  boston_celtics: "Boston Celtics Players",
  new_york_knicks: "New York Knicks Players",
  cleveland_cavaliers: "Cleveland Cavaliers Players",
  chicago_bulls: "Chicago Bulls Players",
  los_angeles_lakers: "Los Angeles Lakers Players",
  philadelphia_76ers: "Philadelphia 76ers Players",
  golden_state_warriors: "Golden State Warriors Players",
  dallas_mavericks: "Dallas Mavericks Players",
  houston_rockets: "Houston Rockets Players",
  denver_nuggets: "Denver Nuggets Players",
  atlanta_hawks: "Atlanta Hawks Players",
  san_antonio_spurs: "San Antonio Spurs Players",
  utah_jazz: "Utah Jazz Players",
  orlando_magic: "Orlando Magic Players",
  new_orleans_pelicans: "New Orleans Pelicans Players",
  oklahoma_city_thunder: "Oklahoma City Thunder Players",
  charlotte_hornets: "Charlotte Hornets Players",
  phoenix_suns: "Phoenix Suns Players",
  pittsburgh_steelers: "Pittsburgh Steelers Players",
  new_england_patriots: "New England Patriots Players",
  indianapolis_colts: "Indianapolis Colts Players",
  dallas_cowboys: "Dallas Cowboys Players",
  new_orleans_saints: "New Orleans Saints Players",
  new_york_giants: "New York Giants Players",
  new_york_jets: "New York Jets Players",
  philadelphia_eagles: "Philadelphia Eagles Players",
  chicago_bears: "Chicago Bears Players",
  washington_commanders: "Washington Commanders Players",
  los_angeles_chargers: "Los Angeles Chargers Players",
  atlanta_falcons: "Atlanta Falcons Players",
  buffalo_bills: "Buffalo Bills Players",
  minnesota_vikings: "Minnesota Vikings Players",
  tampa_bay_buccaneers: "Tampa Bay Buccaneers Players",
  tennessee_titans: "Tennessee Titans Players",
  detroit_lions: "Detroit Lions Players",
  jacksonville_jaguars: "Jacksonville Jaguars Players",
  baltimore_ravens: "Baltimore Ravens Players",
  los_angeles_rams: "Los Angeles Rams Players",
  san_francisco_49ers: "San Francisco 49ers Players",
  green_bay_packers: "Green Bay Packers Players",
  las_vegas_raiders: "Las Vegas Raiders Players",
  carolina_panthers: "Carolina Panthers Players",
  seattle_seahawks: "Seattle Seahawks Players",
  miami_dolphins: "Miami Dolphins Players",
  cincinnati_bengals: "Cincinnati Bengals Players",
  denver_broncos: "Denver Broncos Players",
  houston_texans: "Houston Texans Players",
  kansas_city_chiefs: "Kansas City Chiefs Players",
  cleveland_browns: "Cleveland Browns Players",
  arizona_cardinals: "Arizona Cardinals Players",
  everton_fc: "Everton FC Players",
  manchester_city_fc: "Manchester City FC Players",
  chelsea_fc: "Chelsea FC Players",
  arsenal_fc: "Arsenal FC Players",
  manchester_united_fc: "Manchester United FC Players",
  fulham_fc: "Fulham FC Players",
  aston_villa_fc: "Aston Villa FC Players",
  newcastle_united_fc: "Newcastle United FC Players",
  sunderland_afc: "Sunderland AFC Players",
  tottenham_hotspur_fc: "Tottenham Hotspur FC Players",
  west_ham_united_fc: "West Ham United FC Players",
  brighton_hove_albion_fc: "Brighton Hove Albion FC Players",
  burnley_fc: "Burnley FC Players",
  crystal_palace_fc: "Crystal Palace FC Players",
  nottingham_forest_fc: "Nottingham Forest FC Players",
  wolverhampton_wanderers_fc: "Wolverhampton Wanderers FC Players",
  afc_bournemouth: "AFC Bournemouth Players",
  brentford_fc: "Brentford FC Players",
  liverpool_fc: "Liverpool FC Players",
  leeds_united_fc: "Leeds United FC Players",
  cd_alcoyano: "CD Alcoyano Players",
  olympique_lyonnais: "Olympique Lyon Players",
  stade_rennais_fc: "Stade Rennes FC Players",
  lille_osc: "Lille OSC Players",
  rc_strasbourg_alsace: "RC Strasbourg Alsace Players",
  aj_auxerre: "AJ Auxerre Players",
  as_monaco_fc: "AS Monaco FC Players",
  olympique_de_marseille: "Olympique de Marseille Players",
  toulouse_fc: "Toulouse FC Players",
  fc_lorient: "FC Lorient Players",
  ogc_nice: "OGC Nice Players",
  paris_saint_germain_fc: "Paris Saint-Germain FC Players",
  sc_fives: "SC Fives Players",
  toulouse_fc_alt: "Toulouse FC Alt Players",
  olympique_lillois: "Olympique Lillois Players",
  ef_reims_champagne: "EF Reims Champagne Players",
  rc_lens: "RC Lens Players",
  fc_nantes: "FC Nantes Players",
  paris_fc: "Paris FC Players",
  angers_sco: "Angers SCO Players",
  fc_metz: "FC Metz Players",
  le_havre_ac: "Le Havre AC Players",
  stade_brestois_29: "Stade Brestois 29 Players",
  atletico_de_madrid: "Atletico de Madrid Players",
  real_betis_balompie: "Real Betis Balompie Players",
  athletic_club: "Athletic Club Players",
  real_madrid_club_de_futbol: "Real Madrid Club de Futbol Players",
  valencia_cf: "Valencia CF Players",
  ad_almeria: "AD Almeria Players",
  alcobendas_cf: "Alcobendas CF Players",
  elche_cf: "Elche CF Players",
  girona_fc: "Girona FC Players",
  rcd_espanyol_de_barcelona: "RCD Espanyol de Barcelona Players",
  rcd_celta_de_vigo: "RCD Celta de Vigo Players",
  rcd_mallorca: "RCD Mallorca Players",
  villarreal_cf: "Villarreal CF Players",
  levante_ud: "Levante UD Players",
  getafe_cf: "Getafe CF Players",
  club_atletico_osasuna: "Club Atletico Osasuna Players",
  rayo_vallecano: "Rayo Vallecano Players",
  deportivo_alaves: "Deportivo Alaves Players",
  real_oviedo: "Real Oviedo Players",
  real_sociedad: "Real Sociedad Players",
  sevilla_fc: "Sevilla FC Players",
  fc_st_pauli: "FC St Pauli Players",
  vfb_stuttgart: "VFB Stuttgart Players",
  borussia_monchengladbach: "Borussia Monchengladbach Players",
  vfl_wolfsburg: "VFL Wolfsburg Players",
  fc_bayern_munich: "FC Bayern Munich Players",
  bayer_04_leverkusen: "Bayer 04 Leverkusen Players",
  fc_koln: "FC Koln Players",
  fsmainz_05: "FS Mainz 05 Players",
  sc_freiburg: "SC Freiburg Players",
  fc_union_berlin: "FC Union Berlin Players",
  fc_heidenheim_1846: "FC Heidenheim 1846 Players",
  tsg_1899_hoffenheim: "TSG 1899 Hoffenheim Players",
  eintracht_frankfurt: "Eintracht Frankfurt Players",
  rb_leipzig: "RB Leipzig Players",
  borussia_dortmund: "Borussia Dortmund Players",
  sv_werder_bremen: "SV Werder Bremen Players",
  real_madrid_cf: "Real Madrid CF Players",
  atletico_madrid_cf: "Atletico Madrid CF Players",
  espanyol_de_huelva: "Espanyol de Huelva Players",
  atletico_de_baleares: "Atletico de Baleares Players",
  girona_cf: "Girona CF Players",
  almeria_cf: "Almeria CF Players",
  cadiz_cf: "Cadiz CF Players",
  rayo_vallecano_cf: "Rayo Vallecano CF Players",
  fsv_mainz_05: "FSV Mainz 05 Players",
  video_game: "Video Games for ",
  nintendo_switch: "Nintendo Switch",
  playstation_5: "Playstation 5",
  xbox_series_x: "Xbox Series X",
  pc: "PC",
  nintendo_ds: "Nintendo DS",
  nintendo_3ds: "Nintendo 3DS",
  wii_u: "Wii U",
  wii: "Wii",
  game_boy: "Game Boy",
  game_boy_color: "Game Boy Color",
  game_boy_advance: "Game Boy Advance",
  playstation_4: "Playstation 4",
  playstation_3: "Playstation 3",
  xbox_one: "Xbox One",
  xbox_360: "Xbox 360",
  ps_vita: "PS Vita",
  ps_2: "PS 2",
  ps_1: "PS 1",
};

const propertyMap: PropertyMap = {
  gender_list: "wdt:P21",
  occupation_list: "wdt:P106",
  citizenship_list: "wdt:P27",
  member_of_sports_team_list: "wdt:P54",
  film_instance_of_list: "wdt:P31",
  video_game_instance_of_list: "wdt:P31",
  video_game_console_list: "wdt:P400",
  song_form_of_creative_work: "wdt:P7937",
  genre_list: "wdt:P136",
  film_director_list: "wdt:P57",
};

// Value mappings: Maps property names to dictionaries of value labels and QIDs 
// remember to fix all of these, not all are correct
const valueMaps: ValueMaps = {
  // Singer/Politician/Actor/Scientist/Director/Writer based on Nationality
  gender_list: {
    Male: "Q6581097",
    Female: "Q6581072",
  },
  occupation_list: {
    singer: "Q177220",
    politician: "Q82955",
    actor: "Q33999",
    scientist: "Q901",
    director: "Q2526255",
    writer: "Q36180",
  },
  citizenship_list: {
    Canada: "Q16",
    United_States: "Q30",
    United_Kingdom: "Q145",
    Japan: "Q17",
    Korea: "Q884",
    Australia: "Q408",
  },

  // Movie and directors
  film_instance_of_list: {
    film: "Q11424",
  },

  film_director_list: {
    joss_whedon: "Q298025",
    george_lucas: "Q38222",
    christopher_nolan: "Q25191",
    quentin_tarantino: "Q3772",
    david_lynch: "Q2071",
    martin_scorsese: "Q41148",
    alfred_hitchcock: "Q7374",
    steven_spielberg: "Q8877",
    ridley_scott: "Q56005",
    robert_zemeckis: "Q187364",
    james_cameron: "Q42574",
  },


  // video games on consoles
  video_game_instance_of_list: {
    video_game: "Q7889",
  },
  video_game_console_list: {
    nintendo_switch: "Q19610114",    
    playstation_5: "Q63184502",
    xbox_series_x: "Q64513817",
    pc: "Q1406",
    nintendo_ds: "Q170323",
    nintendo_3ds: "Q203597",
    wii_u: "Q56942",
    wii: "Q8079",
    game_boy: "Q186437",
    game_boy_color: "Q203992",
    game_boy_advance: "Q188642",
    playstation_4: "Q5014725",
    playstation_3: "Q10683",
    xbox_one: "Q13361286",
    xbox_360: "Q48263",
    ps_vita: "Q188808",
    ps_2: "Q10680",
    ps_1: "Q10677",
  },

  // TODO:
  song_form_of_creative_work: {
    song: "Q7366",
  },
  genre_list: {
    rock: "Q11399",
    pop: "Q37073",
    jazz: "Q8341",
    classical: "Q9730",
    electronic: "Q624661",
    country: "Q83440",
    hip_hop: "Q11401",
  },

  // Sports teams
  member_of_sports_team_list: {
    toronto_raptors: "Q132880",
    boston_celtics: "Q131371",
    new_york_knicks: "Q131364",
    cleveland_cavaliers: "Q162990",
    chicago_bulls: "Q128109",
    los_angeles_lakers: "Q121783",
    philadelphia_76ers: "Q138089",
    golden_state_warriors: "Q157376",
    dallas_mavericks: "Q132893",
    houston_rockets: "Q161345",
    denver_nuggets: "Q162954",
    atlanta_hawks: "Q159893",
    san_antonio_spurs: "Q159729",
    utah_jazz: "Q170649",
    orlando_magic: "Q161337",
    new_orleans_pelicans: "Q172339",
    oklahoma_city_thunder: "Q180950",
    charlotte_hornets: "Q163480",
    phoenix_suns: "Q164177",
    // NFL Teams
    pittsburgh_steelers: "Q191477",
    new_england_patriots: "Q193390",
    indianapolis_colts: "Q193753",
    dallas_cowboys: "Q204862",
    new_orleans_saints: "Q172435",
    new_york_giants: "Q190618",
    new_york_jets: "Q219602",
    philadelphia_eagles: "Q219714",
    chicago_bears: "Q205033",
    washington_commanders: "Q212654",
    los_angeles_chargers: "Q272220",
    atlanta_falcons: "Q272059",
    buffalo_bills: "Q221626",
    minnesota_vikings: "Q221150",
    tampa_bay_buccaneers: "Q320476",
    tennessee_titans: "Q320484",
    detroit_lions: "Q271880",
    jacksonville_jaguars: "Q272223",
    baltimore_ravens: "Q276539",
    los_angeles_rams: "Q337377",
    san_francisco_49ers: "Q337758",
    green_bay_packers: "Q213837",
    las_vegas_raiders: "Q324523",
    carolina_panthers: "Q330120",
    seattle_seahawks: "Q221878",
    miami_dolphins: "Q223243",
    cincinnati_bengals: "Q223511",
    denver_broncos: "Q223507",
    houston_texans: "Q223514",
    kansas_city_chiefs: "Q223522",
    cleveland_browns: "Q223527",
    arizona_cardinals: "Q224164",
    everton_fc: "Q5794",
    manchester_city_fc: "Q50602",
    chelsea_fc: "Q9616",
    arsenal_fc: "Q9617",
    manchester_united_fc: "Q18656",
    fulham_fc: "Q18708",
    aston_villa_fc: "Q18711",
    newcastle_united_fc: "Q18716",
    sunderland_afc: "Q18739",
    tottenham_hotspur_fc: "Q18741",
    west_ham_united_fc: "Q18747",
    brighton_hove_albion_fc: "Q19453",
    burnley_fc: "Q19458",
    crystal_palace_fc: "Q19467",
    nottingham_forest_fc: "Q19490",
    wolverhampton_wanderers_fc: "Q19500",
    afc_bournemouth: "Q19568",
    brentford_fc: "Q19571",
    liverpool_fc: "Q1130849",
    leeds_united_fc: "Q1128631",
    cd_alcoyano: "Q837238",
    // Ligue 1 Teams
    olympique_lyonnais: "Q704",
    stade_rennais_fc: "Q19509",
    lille_osc: "Q19516",
    rc_strasbourg_alsace: "Q126334",
    aj_auxerre: "Q182876",
    as_monaco_fc: "Q180305",
    olympique_de_marseille: "Q132885",
    toulouse_fc: "Q19518",
    fc_lorient: "Q48911",
    ogc_nice: "Q185163",
    paris_saint_germain_fc: "Q483020",
    sc_fives: "Q1514915",
    toulouse_fc_alt: "Q2422417",
    olympique_lillois: "Q2338486",
    ef_reims_champagne: "Q3590859",
    rc_lens: "Q191843",
    fc_nantes: "Q192071",
    paris_fc: "Q1051013",
    angers_sco: "Q845137",
    fc_metz: "Q221525",
    le_havre_ac: "Q328658",
    stade_brestois_29: "Q218372",
    atletico_de_madrid: "Q8701",
    real_betis_balompie: "Q8723",
    athletic_club: "Q8687",
    real_madrid_club_de_futbol: "Q8682",
    valencia_cf: "Q10333",
    ad_almeria: "Q290781",
    alcobendas_cf: "Q583632",
    elche_cf: "Q10512",
    girona_fc: "Q11945",
    rcd_espanyol_de_barcelona: "Q8780",
    rcd_celta_de_vigo: "Q8749",
    rcd_mallorca: "Q8835",
    villarreal_cf: "Q12297",
    levante_ud: "Q8823",
    getafe_cf: "Q8806",
    club_atletico_osasuna: "Q10286",
    rayo_vallecano: "Q10300",
    deportivo_alaves: "Q223620",
    real_oviedo: "Q271574",
    real_sociedad: "Q10315",
    sevilla_fc: "Q10329",
    fc_st_pauli: "Q6463",
    vfb_stuttgart: "Q4512",
    borussia_monchengladbach: "Q101959",
    vfl_wolfsburg: "Q101859",
    fc_bayern_munich: "Q15789",
    bayer_04_leverkusen: "Q104761",
    fc_koln: "Q104770",
    fsv_mainz_05: "Q105254",
    sc_freiburg: "Q106394",
    fc_union_berlin: "Q141971",
    fc_heidenheim_1846: "Q162251",
    tsg_1899_hoffenheim: "Q22707",
    eintracht_frankfurt: "Q38245",
    rb_leipzig: "Q702455",
    borussia_dortmund: "Q41420",
    sv_werder_bremen: "Q51976",
  },
};

/**
 * Combinations: Arrays of property names to combine into categories
 *
 * Each array defines a combination of properties that will be used to generate categories.
 * All possible combinations of values from these properties will be created.
 *
 * Example: ["gender_list", "occupation_list", "citizenship_list"]
 * will create categories like "Male Singers from Canada", "Female Singers from Canada", etc.
 */
const combinations: string[][] = [
  ["gender_list", "occupation_list", "citizenship_list"],
  ["member_of_sports_team_list"],
  ["video_game_instance_of_list", "video_game_console_list"],
  ["song_form_of_creative_work", "genre_list"],
  ["film_instance_of_list", "film_director_list"],
];

async function createCategories() {
  console.log("Starting category generation...");

  try {
    const generatedCategories = generateAllCategories(
      propertyMap,
      valueMaps,
      nameMap,
      combinations
    );

    console.log(`Generated ${generatedCategories.length} categories`);

    let created = 0;
    let updated = 0;
    let errors = 0;
    const today = new Date();

    for (const category of generatedCategories) {
      try {
        const result = await prisma.category.upsert({
          where: { slug: category.slug },
          update: {
            isDaily: true,
            hasBeenSelected: false,
            updatedAt: today,
          },
          create: {
            slug: category.slug,
            name: category.name,
            sparql: category.sparql,
            updateSparql: category.updateSparql,
            isDaily: true,
            hasBeenSelected: false,
            createdAt: today,
            updatedAt: today,
            difficulties: {
              create: [
                { level: 1, limit: 10 },
                { level: 2, limit: 50 },
                { level: 3, limit: 100 },
              ],
            },
          },
        });

        if (result) {
          const existingDifficulties = await prisma.difficulty.findMany({
            where: { categoryId: result.id },
          });

          if (existingDifficulties.length === 0) {
            created++;
          } else {
            updated++;
          }
        }
      } catch (error) {
        console.error(`Error creating category ${category.slug}:`, error);
        errors++;
      }
    }

    console.log("\nCategory creation summary:");
    console.log(`  Created: ${created}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Errors: ${errors}`);
    console.log(`  Total: ${generatedCategories.length}`);
  } catch (error) {
    console.error("Error generating categories:", error);
    throw error;
  }
}

async function main() {
  try {
    await createCategories();
    console.log("\nAll categories processed successfully.");
  } catch (error) {
    console.error("Fatal error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log("Script completed.");
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("Script failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
