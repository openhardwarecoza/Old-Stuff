// The temperature/time profile as {secs, temp}
// This profile is linearly interpolated to get the required temperature at any time.

// PLEN is the number of entries per profile
#define PLEN 6

// Leaded Solder Profile
long pb[PLEN][2] =  { {0, 20}, {120, 150}, {210, 190}, {240, 240}, {310, 180}, {400, 0} };  // Kester Sn63/Pb37

// Lead Free Solder Profile
long pbf[PLEN][2] = { {0, 20}, {120, 200}, {220, 220}, {270, 250}, {300, 220}, {400, 0} };  // Sn95.8/Ag3.5/Cu0.7

// Drying Profile
long dry[PLEN][2] = { {0, 20}, {120, 100}, {220, 120}, {280, 140}, {300, 120}, {600, 0} };  // Post Wash Dryout

