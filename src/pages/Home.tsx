import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSpinner,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { clipboardOutline } from "ionicons/icons";
import { useRef, useEffect, useState } from "react";
import ExploreContainer from "../components/ExploreContainer";
import "./Home.css";
import { API } from "aws-amplify";
import { FlightStatus } from "../types/FlightStatus";
import { FlightAwareStatus } from "../types/FlightAwareStatus";

const flightStatuses: {
  [key: string]: { longStatusText: string; statusText: string; color: string };
} = {
  "100": {
    longStatusText: "Not Monitorable",
    statusText: "Unmonitored",
    color: "primary",
  },
  "200": {
    longStatusText: "Not Monitored",
    statusText: "Unmonitored",
    color: "primary",
  },
  "300": {
    longStatusText: "Scheduled",
    statusText: "Scheduled",
    color: "primary",
  },
  "301": { longStatusText: "On Time", statusText: "On Time", color: "success" },
  "302": {
    longStatusText: "In Flight - On Time",
    statusText: "In Flight - On Time",
    color: "success",
  },
  "303": {
    longStatusText: "Arrived - On Time",
    statusText: "Arrived - On Time",
    color: "success",
  },
  "400": {
    longStatusText: "Cancelled",
    statusText: "Cancelled",
    color: "danger",
  },
  "401": { longStatusText: "Delayed", statusText: "Delayed", color: "danger" },
  "402": {
    longStatusText: "In Flight - Late",
    statusText: "In Flight",
    color: "danger",
  },
  "403": {
    longStatusText: "Arrived - Late",
    statusText: "Arrived",
    color: "danger",
  },
  "404": {
    longStatusText: "Diverted",
    statusText: "Diverted",
    color: "danger",
  },
  "405": {
    longStatusText: "Possibly Delayed",
    statusText: "Poss Delayed",
    color: "danger",
  },
  "406": {
    longStatusText: "In Flight - Possibly Late",
    statusText: "In Flight",
    color: "danger",
  },
  "407": {
    longStatusText: "Arrived - Possibly Late",
    statusText: "Arrived",
    color: "danger",
  },
  "408": { longStatusText: "Unknown", statusText: "Unknown", color: "primary" },
};

const IATAToICAO: {[key: string]: string} =  {
  "PR": "BOI",
  "2T": "TBS",
  "Q5": "MLA",
  "4D": "ASD",
  "4R": "SEK",
  "4O": "AIJ",
  "7A": "XRC",
  "7B": "UBE",
  "7S": "RYA",
  "RL": "ABG",
  "W9": "AAB",
  "M3": "TUS",
  "GB": "ABX",
  "ZA": "CYD",
  "VX": "AES",
  "KI": "DHI",
  "Z7*": "ADK",
  "JP": "ADR",
  "AN": "WSN",
  "A3": "AEE",
  "9D": "CND",
  "ML": "AEK",
  "DW": "UCR",
  "SU": "AFL",
  "P3": "PLS",
  "OB": "AAT",
  "SM": "AAW",
  "KJ": "AAZ",
  "YE": "ACQ",
  "VJ": "AFF",
  "QH": "FLA",
  "3O": "MAC",
  "HD": "ADO",
  "UJ": "LMU",
  "A2": "AWG",
  "X9": "NVD",
  "3S*": "AEN",
  "JU": "ASL",
  "XK": "CCM",
  "EI": "EIN",
  "A8": "XAU",
  "RV": "ROU",
  "6U": "ACX",
  "ZI": "AAF",
  "AE": "AE",
  "4K*": "AAS",
  "8U": "AAW",
  "Q9": "AFU",
  "QB": "AAJ",
  "LD": "AHK",
  "2Y": "ADW",
  "UX": "AEA",
  "IG": "AEY",
  "NX": "AMU",
  "ZV": "AMW",
  "HM": "SEY",
  "AF": "AFR",
  "SB": "ACI",
  "EH": "AKX",
  "ED": "AXE",
  "ZW": "AWI",
  "YI": "RSI",
  "GN": "AGN",
  "9T": "RUN",
  "ZB": "ABN",
  "3J": "AAQ",
  "WP": "ATW",
  "BX": "ABL",
  "LB": "LEP",
  "GL": "GRL",
  "3S": "GUY",
  "NQ": "AJX",
  "IJ": "LIB",
  "TT": "KLA",
  "QM": "AIM",
  "L6": "AMI",
  "P8": "MKG",
  "ZQ": "MNE",
  "NZ": "ANZ",
  "4N": "ANT",
  "ZX": "ABL",
  "G8": "AGB",
  "7T": "AGV",
  "6V": "VGA",
  "NH": "ANA",
  "TZ": "TWG",
  "2Q": "SNC",
  "V7": "SNG",
  "AB": "BER",
  "QN": "ARR",
  "AI": "AIC",
  "PJ": "SPM",
  "SZ": "WOW",
  "8C": "ATN",
  "NF": "AVN",
  "CC": "ABD",
  "RB": "SBK",
  "TN": "THT",
  "SW": "NMB",
  "AW": "AFW",
  "PE": "AEL",
  "JM": "AJM",
  "6G": "AWW",
  "TX": "FWI",
  "IX": "AXB",
  "BT": "BTI",
  "EL": "ANK",
  "YW": "ANE",
  "PX": "ANG",
  "G9": "ABY",
  "AC": "ACA",
  "AP": "LAV",
  "E9": "MHS",
  "XT": "AXL",
  "UM": "AZW",
  "S2": "RSH",
  "TC": "ATC",
  "2J": "VBW",
  "KM": "AMC",
  "YT": "TGA",
  "G4": "AAY",
  "O4": "ABV",
  "8T": "TID",
  "3L": "ADY",
  "EM*": "AEB",
  "KD": "AEN",
  "5W": "AEU",
  "VV": "AEW",
  "WK": "AFB",
  "QQ": "UTY",
  "FG": "AFG",
  "RV*": "AFI",
  "Y2": "AFJ",
  "5Z": "AFX",
  "5D": "SLI",
  "1A": "AGT",
  "JJ": "AGX",
  "PL": "PLI",
  "8A": "BMM",
  "GD": "AHA",
  "HT": "AHW",
  "J2": "AHY",
  "U3": "AIA",
  "4Y": "AIB",
  "RS": "ASV",
  "5A": "AIP",
  "ED*": "ABQ",
  "W4": "BES",
  "IZ": "AIZ",
  "M6": "AJT",
  "4A": "AKL",
  "EV": "ASQ",
  "HP": "AWE",
  "6R": "TNO",
  "VH": "ALV",
  "DP": "AMM",
  "AM": "AMX",
  "TL": "ANO",
  "OY": "ANS",
  "IW": "AOM",
  "J6": "AOC",
  "2D": "AOG",
  "VB": "VIV",
  "OE": "AOT",
  "GV": "ARF",
  "JW": "APW",
  "2B": "AWT",
  "4C": "ARE",
  "AR": "ARG",
  "AS": "ASA",
  "HC": "ATI",
  "FO": "ATM",
  "OS": "AUA",
  "IQ": "AUB",
  "RU": "ABW",
  "GR": "AUR",
  "NO": "AUS",
  "AU": "AUT",
  "K8": "ZAK",
  "B9": "BGD",
  "AK": "AXM",
  "D7": "XAX",
  "DJ": "WAJ",
  "I5": "IAD",
  "EX": "BJK",
  "3G": "AYZ",
  "AZ": "AZA",
  "ZE": "AZE",
  "R7": "OCA",
  "RX": "AEH",
  "MQ": "EGF",
  "ZS": "AZI",
  "WI": "WIL",
  "VU": "VUN",
  "BP": "BOT",
  "GS": "UPA",
  "VT": "VTA",
  "3N": "URG",
  "VL": "VIM",
  "FK": "WTA",
  "G2": "VXG",
  "V8": "VAS",
  "K6": "KHV",
  "CA": "CCA",
  "Q6": "CDP",
  "5F": "CIR",
  "QC": "CRD",
  "NV": "CRF",
  "CV": "CVA",
  "CW": "CWM",
  "AH": "DAH",
  "ER": "DHL",
  "EN": "DLA",
  "NM": "DRD",
  "EE": "EAY",
  "4F": "ECE",
  "E8": "ELG",
  "RF": "EOK",
  "KY": "EQL",
  "PC": "FAJ",
  "JH": "FDA",
  "OF": "FIF",
  "FJ": "FJI",
  "RC": "FLI",
  "NY": "FXI",
  "2P": "GAP",
  "2U": "GIP",
  "0A": "GNT",
  "DA": "GRG",
  "LL": "GRO",
  "5Y": "GTI",
  "GG": "GUY",
  "H9": "HAD",
  "IP": "JOL",
  "QK": "JZA",
  "KK": "KKK",
  "JS": "KOR",
  "KC": "KZR",
  "LV": "LBC",
  "QP": "AKJ",
  "D4": "LID",
  "9I": "LLR",
  "XL": "LNE",
  "4Z": "LNK",
  "FL": "LPA",
  "A6": "LPV",
  "TD": "LUR",
  "L8": "LXG",
  "LK": "LXR",
  "MK": "MAU",
  "MD": "MDG",
  "9U": "MLD",
  "L9": "MLI",
  "A7": "MPD",
  "QO": "MPX",
  "MR": "MRT",
  "F4": "NBK",
  "AJ": "NIG",
  "8Y": "PBU",
  "OT": "PEL",
  "AD": "PRZ",
  "QD": "QCL",
  "QS": "QSC",
  "AG": "ARU",
  "MC": "RCH",
  "RE": "REA",
  "UU": "REU",
  "ZP": "AZP",
  "6K": "RIT",
  "A5": "RLA",
  "QL": "RLN",
  "R3": "RME",
  "MV": "RML",
  "2O": "RNE",
  "U8": "RNV",
  "BQ": "ROM",
  "P5": "RPB",
  "E4": "RSO",
  "BF": "RSR",
  "5L": "RSU",
  "JR": "SER",
  "Z3": "SMJ",
  "8D*": "SUW",
  "GM": "SVK",
  "VW": "TAO",
  "JY": "TCI",
  "CG": "TOK",
  "TY": "TPC",
  "TS": "TSC",
  "EC": "TWN",
  "U7": "UGA",
  "KO": "AER",
  "KH": "AAH",
  "AQ": "AAH",
  "AA": "AAL",
  "WD*": "AAN",
  "HO": "DJA",
  "OZ": "AAR",
  "8V": "ACP",
  "XM": "XME",
  "AO": "AUZ",
  "VE": "AVE",
  "6A": "CHP",
  "AV": "AVA",
  "A0": "MCJ",
  "O6": "ONE",
  "2K": "GLG",
  "V5": "VLI",
  "CJ": "CFE",
  "TH": "BRT",
  "B4": "BCF",
  "UP": "BHS",
  "8Q*": "BAJ",
  "V9": "BTC",
  "BA": "BAW",
  "BG": "BBC",
  "BO": "BBD",
  "SI": "BCI",
  "WX": "BCY",
  "BZ": "BDA",
  "JA": "BON",
  "J4": "BFL",
  "8H": "BGH",
  "U4": "BHA",
  "UH": "BHL",
  "4T": "BHP",
  "BS": "BIH",
  "PG": "BKP",
  "KF": "BLF",
  "JV": "BLS",
  "B3": "BLV",
  "BD": "BMA",
  "BM": "BMR",
  "WW": "BMI",
  "CH": "BMJ",
  "BN": "BNF",
  "BV": "BPA",
  "7R": "BRB",
  "8E": "BRG",
  "B2": "BRU",
  "GQ": "BSY",
  "ID": "BTK",
  "4B": "BTQ",
  "Y6": "BTV",
  "1T": "BUC",
  "BU": "BUN",
  "J8": "BVT",
  "QW": "BWG",
  "SN": "BXI",
  "DB": "BZH",
  "JD": "CBJ",
  "NT": "IBB",
  "0B": "BLA",
  "FB": "LZB",
  "8N": "NKF",
  "YB": "BRJ",
  "MX": "MXY",
  "7N": "PWD",
  "KR": "KME",
  "5C": "ICL",
  "3C": "CMV",
  "MO": "CAV",
  "R9": "CAM",
  "UY": "UYC",
  "C6": "CJA",
  "CP": "CDN",
  "7F": "AKT",
  "W2": "CWA",
  "9K": "KAP",
  "PT": "CCI",
  "2G": "CRG",
  "W8": "CJT",
  "C8": "ICV",
  "BW": "BWA",
  "8B": "GFI",
  "V3": "KRP",
  "KA": "HDA",
  "CX": "CPA",
  "KX": "CAY",
  "5J": "CEB",
  "9M": "GLR",
  "J7": "CVC",
  "WE": "CWC",
  "OP": "CHK",
  "MG": "CCP",
  "2Z": "CGN",
  "S8": "CSU",
  "RP*": "CHQ",
  "CI": "CAL",
  "CK": "CKK",
  "MU": "CES",
  "G5": "HXA",
  "WH": "CNW",
  "CZ": "CSN",
  "KN": "CUA",
  "XO": "CXH",
  "3Q": "CYH",
  "X7": "CHF",
  "OQ": "CQN",
  "QI": "CIM",
  "C7": "CIN",
  "C9": "RUS",
  "G3": "CIX",
  "CT": "CAT",
  "6P": "ISG",
  "9L": "CJC",
  "YD": "CAT",
  "OH": "COM",
  "MN": "CAW",
  "C5": "UCA",
  "DE": "CFG",
  "CO": "COA",
  "CS": "CMI",
  "V0": "VCV",
  "CM": "CMP",
  "CQ": "CCW",
  "XC": "CAI",
  "CD": "CND",
  "LF": "VTE",
  "SS": "CRL",
  "F5": "COZ",
  "7C": "COY",
  "OU": "CTN",
  "QE": "ECC",
  "CU": "CUB",
  "CY": "CYP",
  "YK": "KYV",
  "OK": "CSA",
  "8L": "CGP",
  "XG": "CLI",
  "PN": "CHB",
  "WD": "DSR",
  "DX": "DTR",
  "D0": "DHK",
  "ES": "DHX",
  "L3": "JOS",
  "D3": "DAO",
  "N2": "DAG",
  "H8": "KHB",
  "DD": "DDL",
  "0D": "DWT",
  "D5": "DAU",
  "DL": "DAL",
  "1I": "AMB",
  "DH": "DVA",
  "Z6": "UDN",
  "YU": "ADM",
  "DO": "DOA",
  "E3": "DMO",
  "D9": "DNV",
  "KB": "DRK",
  "DI": "BAG",
  "9E": "EDV",
  "H7": "EGU",
  "9A": "EZX",
  "S9": "HSA",
  "EA": "EAL",
  "T3": "EZE",
  "QF": "EAQ",
  "DK": "ELA",
  "DS": "EZS",
  "U2": "EZY",
  "MS": "MSR",
  "LY": "ELY",
  "UZ": "BRQ",
  "EK": "UAE",
  "EM": "CFS",
  "EU": "EEA",
  "E0": "ESS",
  "B8": "ERT",
  "E7": "ESF",
  "OV": "ELL",
  "ET": "ETH",
  "EY": "ETD",
  "MM": "MMZ",
  "UI": "ECA",
  "GJ": "EEZ",
  "K2": "ELO",
  "3W": "EMX",
  "5O": "FPO",
  "QY": "BCS",
  "EW": "EWG",
  "E2": "EWE",
  "BR": "EVA",
  "EZ": "EIA",
  "ZD": "EWR",
  "JN": "XLA",
  "MB": "EXA",
  "OW": "EXK",
  "EO": "LHN",
  "FE": "FEA",
  "F6": "RCK",
  "F3": "FSW",
  "FX": "FDX",
  "N8": "HGK",
  "4S": "FNC",
  "AY": "FIN",
  "FC": "WBA",
  "FY": "FFM",
  "8F": "FFR",
  "8D": "EXV",
  "B5": "FLT",
  "PA": "FCL",
  "F2": "FLM",
  "8W": "EDR",
  "G6": "ACY",
  "9Y": "FGE",
  "OJ": "FJM",
  "9P": "FJL",
  "SH": "FLY",
  "F7": "BBO",
  "BE": "BEE",
  "FT": "FEG",
  "SX": "TOR",
  "W3": "FYH",
  "TE": "LIL",
  "XY": "KNE",
  "FS": "FOX",
  "VK": "FVK",
  "VY": "FOS",
  "HK": "FSC",
  "FH": "FHY",
  "SJ": "FOM",
  "F9": "FFT",
  "2F": "FTA",
  "FZ": "FDB",
  "Y5": "GMR",
  "GT": "GBL",
  "Z5": "GMG",
  "7O": "GAL",
  "GC": "GNR",
  "G7": "GNF",
  "GA": "GIA",
  "4G": "GZP",
  "A9": "TGZ",
  "HE": "LGW",
  "ST": "GMI",
  "4U": "GWI",
  "GP": "RIV",
  "GH": "GLP",
  "G0": "GHB",
  "DC": "GAO",
  "ZK": "GLA",
  "HB": "HGB",
  "J9": "GIF",
  "GF": "GFA",
  "H6": "HAG",
  "HR": "HHN",
  "HU": "CHH",
  "X3": "HLX",
  "HF": "HLF",
  "HQ": "HMY",
  "HA": "HAL",
  "HN": "HVY",
  "JB": "JBA",
  "ZU": "HCY",
  "HJ": "HEJ",
  "HW": "FHE",
  "2L": "OAW",
  "UD": "HER",
  "5K": "HFY",
  "VM": "VMS",
  "H5": "HOA",
  "HX": "CRK",
  "RH": "HKC",
  "UO": "HKE",
  "QX": "QXE",
  "I4": "EXP",
  "IK": "KAR",
  "IB": "IBE",
  "II": "CSQ",
  "I2": "IBS",
  "FW": "IBX",
  "0C": "IBL",
  "C3": "IPR",
  "FI": "ICE",
  "I7": "IOA",
  "6E": "IGO",
  "IC": "IAC",
  "I9": "IBU",
  "VP": "AXC",
  "QZ": "AWQ",
  "IO": "IAA",
  "C4": "IMX",
  "H4": "IIN",
  "D6": "ILN",
  "N/A": "NCC",
  "6I": "IBZ",
  "IR": "IRA",
  "EP": "IRC",
  "IA": "IAW",
  "IH": "MZA",
  "2S": "SDY",
  "IF": "ISW",
  "WC": "ISV",
  "6H": "ISR",
  "GI": "IKA",
  "JC": "JEX",
  "JO": "JAZ",
  "MT": "JMC",
  "JI": "JAE",
  "3X": "JAC",
  "JL": "JAL",
  "EG": "JAA",
  "NU": "JTA",
  "O2": "JEA",
  "9W": "JAI",
  "PP": "PJS",
  "3K": "JSA",
  "LS": "EXS",
  "B6": "JBU",
  "JF": "JAA",
  "0J": "JCS",
  "SG": "JGO",
  "JQ": "JST",
  "GK": "JJP",
  "JX": "JEC",
  "GX": "JXX",
  "LJ": "JNA",
  "R5": "JAV",
  "XE": "JSX",
  "6J": "JUB",
  "KW": "KHK",
  "WA": "KLC",
  "KL": "KLM",
  "K4": "CKS",
  "K9": "KFS",
  "CB*": "KII",
  "RQ": "KMF",
  "V2": "AKT",
  "KV": "MVD",
  "M5": "KEN",
  "KQ": "KQA",
  "ZN": "KEY",
  "KG": "LYM",
  "IT": "KFR",
  "4I": "KNX",
  "Y9": "IRK",
  "KP": "KIA",
  "7K": "KGL",
  "8J": "KMV",
  "KE": "KAL",
  "GW": "KIL",
  "VD": "KPA",
  "KU": "KAC",
  "GO": "KZU",
  "N5": "KGZ",
  "R8": "KGA",
  "YQ": "LCT",
  "LR": "LRC",
  "4M": "DSM",
  "UC": "LCO",
  "LA": "LAN",
  "LU": "LXP",
  "PZ": "LAP",
  "LP": "LPE",
  "LO": "LOT",
  "LT": "LTU",
  "N6": "JEV",
  "QV": "LAO",
  "L7": "LPN",
  "NG": "LDA",
  "OE[36]": "LDM",
  "LQ": "LAQ",
  "LI": "LIA",
  "LN": "LAA",
  "TM": "LAM",
  "JT": "LNI",
  "LM": "LVG",
  "LH": "DLH",
  "CL": "CLH",
  "L5": "LTR",
  "LG": "LGL",
  "5V": "UKW",
  "L2": "LYC",
  "L4": "SSX",
  "Z8": "AZN",
  "MJ": "LPR",
  "Q2": "DQA",
  "OD": "MXD",
  "M7": "MAA",
  "MH": "MWG",
  "IN": "MAK",
  "OM": "MGL",
  "DM": "DAN",
  "W5": "IRM",
  "M2": "MZS",
  "TF": "SCW",
  "MA": "MAH",
  "RI": "MDL",
  "JE": "MNO",
  "MP": "MPH",
  "8M": "MXL",
  "MY": "MXJ",
  "MW": "MYD",
  "7M": "MYI",
  "M8": "MKN",
  "IM": "MNJ",
  "MZ": "MNA",
  "YV": "ASH",
  "XJ": "MES",
  "ME": "MEA",
  "YX": "MEP",
  "M4": "MSA",
  "2M": "MDV",
  "YM": "MGX",
  "5M": "MNT",
  "3R": "GAI",
  "M9": "MSI",
  "N4": "MTC",
  "Z9": "MYM",
  "VZ": "MYT",
  "UB": "UBA",
  "ZT": "AWC",
  "6N": "NIN",
  "DV": "ACK",
  "UE": "NAS",
  "N7": "ROK",
  "NA": "NAL",
  "NC": "NJS",
  "CE": "NTW",
  "RA": "RNA",
  "EJ": "NEA",
  "2N": "NTJ",
  "HG": "NLY",
  "KZ": "NCA",
  "XW": "NCT",
  "5N": "AUL",
  "Y7": "TYA",
  "N0": "NBT",
  "7H": "RVF",
  "NW": "NWA",
  "J3": "PLR",
  "D8*": "IBK",
  "DY": "NOZ",
  "DN": "NAA",
  "DU": "NLH",
  "D8": "NSZ",
  "BJ": "LBT",
  "O9": "NOV",
  "VQ": "NVQ",
  "UQ": "OCM",
  "O8": "OHK",
  "VC": "VCX",
  "OL": "OLT",
  "OA": "OAL",
  "WY": "OMA",
  "8Q": "OHY",
  "R2": "ORB",
  "OX": "OEA",
  "ON": "RON",
  "O7": "OZJ",
  "PV": "PNR",
  "9Q": "PBA",
  "PU": "PUA",
  "BL": "PIC",
  "8P": "PCO",
  "Q8": "PEC",
  "LW": "NMI",
  "PK": "PIA",
  "PF": "PNW",
  "NR": "PIR",
  "KS": "PEN",
  "P9": "PGP",
  "Z2": "EZD",
  "9R": "VAP",
  "PI": "PDT",
  "PO": "PAC",
  "PH": "PAO",
  "PD": "POE",
  "NI": "PGA",
  "BK": "PDC",
  "PW": "PRF",
  "TO": "PSD",
  "P6": "PVG",
  "P0": "PFZ",
  "PB": "SPR",
  "FV": "PLK",
  "QR": "QTR",
  "V4": "REK",
  "YS": "RAE",
  "FN": "RGL",
  "ZL": "RXA",
  "P7": "REP",
  "RW": "RPA",
  "SL": "RSL",
  "GZ": "RAR",
  "RR": "RFR",
  "AT": "RAM",
  "R0": "RPK",
  "BI": "RBA",
  "RJ": "RJA",
  "RK": "RCT",
  "WR": "HRH",
  "WB": "RWD",
  "RD": "RYN",
  "FR": "RYR",
  "RT": "BUG",
  "TR": "TGW",
  "6Y": "ART",
  "3Z": "TVP",
  "6D": "TVQ",
  "N9": "SHA",
  "7E": "AWU",
  "S4": "RZO",
  "SA": "SAA",
  "W7": "SAH",
  "NL": "SAI",
  "SK": "SAS",
  "UG": "SEN",
  "S7": "SBI",
  "Q7": "SBM",
  "BB": "SBS",
  "S5": "SDG",
  "K5": "SQH",
  "SY": "SCX",
  "I6": "SEQ",
  "7G": "SFJ",
  "FA": "SFR",
  "HZ": "SHU",
  "SP": "SAT",
  "ZY": "SHY",
  "SQ": "SIA",
  "3M": "SIL",
  "XS": "SIT",
  "D2": "SSF",
  "5G": "SSV",
  "SD": "SUD",
  "SV": "SVA",
  "WN": "SWA",
  "A4": "SWD",
  "WG": "SWG",
  "WQ": "SWQ",
  "LX": "SWR",
  "SR": "SWR",
  "LZ[56]": "SWU",
  "WV": "SWV",
  "Q4": "SWX",
  "WO": "WSW",
  "XQ": "SXS",
  "AL": "SYX",
  "7L": "AZG",
  "E5": "BRZ",
  "SC": "CDG",
  "9C": "CQH",
  "3U": "CSC",
  "FM": "CSH",
  "ZH": "CSZ",
  "NE": "ESK",
  "SO": "HKA",
  "JK": "JKK",
  "RZ*": "LRS",
  "2G*": "MRR",
  "1Z": "APD",
  "NK": "NKS",
  "S0": "OKS",
  "VA": "OZW",
  "S3": "BBR",
  "H2": "SKU",
  "OO": "SKW",
  "JZ": "SKX",
  "BC": "SKY",
  "MI": "SLK",
  "6Q": "SLL",
  "PY": "SLM",
  "NB": "SNB",
  "IE": "SOL",
  "6W": "SOV",
  "O3": "CSS",
  "PQ": "SQP",
  "P2": "LLI",
  "5P": "LLX",
  "UL": "ALK",
  "DG": "SRQ",
  "1L": "OSY",
  "DT": "DTA",
  "VR": "TCV",
  "TI": "TWI",
  "EQ": "TAE",
  "QT": "TPA",
  "TQ": "TDM",
  "TP": "TAP",
  "K3": "TQN",
  "RO": "ROT",
  "SF": "DTH",
  "T6": "TVR",
  "T2": "TCG",
  "FD": "AIQ",
  "TG": "THA",
  "T9": "TSX",
  "3P": "TNM",
  "3V": "TAY",
  "TJ": "GPD",
  "AX": "LOF",
  "TW": "TWA",
  "UN": "TSO",
  "GE": "TNA",
  "HV": "TRA",
  "GY": "TMG",
  "T4": "TIB",
  "PM": "TOS",
  "BY": "TOM",
  "TB": "JAF",
  "OR": "TFL",
  "6B": "BLX",
  "TU": "TAR",
  "3T": "URN",
  "TK": "THY",
  "T5": "TUA",
  "T7": "TJT",
  "VO": "TYR",
  "U5": "GWY",
  "B7": "UIA",
  "UA": "UAL",
  "4H": "UBD",
  "U6": "SVR",
  "QU": "UGA",
  "UR": "UGD",
  "UF": "UKM",
  "6Z": "UKS",
  "5X": "UPS",
  "US": "AWE",
  "UT": "UTA",
  "HY": "UZB",
  "PS": "AUI",
  "VF": "VLU",
  "0V": "VFC",
  "VN": "HVN",
  "KWA	Vozdushnaya": "Academy",
  "NN": "MOV",
  "Y4": "VOI",
  "VI": "VDA",
  "TV": "VEX",
  "VS": "VIR",
  "ZG": "VVM",
  "XF": "VLK",
  "LC": "VLO",
  "9V": "VPA",
  "RG": "VRN",
  "VG": "VLM",
  "UK": "VTI",
  "WT": "WSG",
  "2W": "WLC",
  "WZ": "WSF",
  "YH": "WCW",
  "8O": "YWZ",
  "WS": "WJA",
  "ST*": "STT",
  "CN": "WWD",
  "WF": "WIF",
  "WIG	Wiggins": "Airways",
  "WL": "WLS",
  "IV": "JET",
  "7W": "QGA",
  "8Z": "WVL",
  "W6": "WZZ",
  "3W*": "VNR",
  "MF": "CXA",
  "SE": "SEU",
  "XN": "XAR",
  "XP": "CXP",
  "YL": "LLM",
  "Y8": "YZR",
  "Y0": "EMJ",
  "IY": "IYE",
  "Q3": "MBN",
  "Z4": "OOM",
}

const millisecondsUntilTime = (timeIn: Date) => {
  return timeIn.getTime() - new Date().getTime();
};

const durationString = (millisecondsIn: number) => {
  const milliseconds = Math.abs(millisecondsIn);
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(milliseconds / (1000 * 60 * 60) - days * 24);
  const minutes = Math.floor(
    milliseconds / (1000 * 60) - (days * 24 * 60 + hours * 60)
  );

  if (days > 0) {
    return `${days}d, ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h, ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

const dateObjectsAreSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

const Home: React.FC = () => {
  const [present] = useIonToast();

  const presentToast = (
    message: string,
    position: "top" | "middle" | "bottom"
  ) => {
    present({
      message: message,
      duration: 2000,
      position: position,
    });
  };

  const accordionGroup = useRef<null | HTMLIonAccordionGroupElement>(null);

  const [flights, setFlights] = useState<Array<FlightStatus>>([]);
  const [flightMaps, setFlightMaps] = useState<{
    [key: string]: { map: string; fetchedDate: Date };
  }>({});
  const flightMapsRef = useRef(flightMaps);

  const [flightAwareStatuses, setFlightAwareStatuses] = useState<{
    [key: string]: { status: FlightAwareStatus; fetchedDate: Date };
  }>({});
  const flightAwareStatusesRef = useRef(flightAwareStatuses);

  useEffect(() => {
    flightMapsRef.current = flightMaps;
    flightAwareStatusesRef.current = flightAwareStatuses;
  });

  const getFlightsFunction = async () => {
    const newFlights = (await API.get(
      "tripItFlightsAdapter",
      "/tripit/flights/asdf",
      {}
    )) as Array<FlightStatus>;
    setFlights(newFlights);
    await updateFlightAwareStatuses(newFlights);
    return newFlights;
  };

  let mapSize = Math.min(400, Math.floor(window.innerWidth) - 60);

  const getFlightAwareStatusForIdent = async (
    ident: string,
    start: string,
    end: string,
    getMap: boolean
  ) => {
    let fa_flight_id = undefined;

    if (
      flightAwareStatusesRef.current[ident] === undefined ||
      new Date().getTime() -
        flightAwareStatusesRef.current[ident].fetchedDate.getTime() >
        900000
    ) {
      const newFlightInfo = {
        status: (await API.get(
          "flightAwareAdapter",
          `/flightaware/details/${ident}?start=${start}&end=${end}`,
          {}
        )) as FlightAwareStatus,
        fetchedDate: new Date(),
      };

      fa_flight_id = newFlightInfo.status.fa_flight_id;

      setFlightAwareStatuses((flightAwareStatuses) => ({
        ...flightAwareStatuses,
        [ident]: newFlightInfo,
      }));
    }

    if (
      getMap &&
      (flightMapsRef.current[ident] === undefined ||
        new Date().getTime() -
          flightMapsRef.current[ident].fetchedDate.getTime() >
          900000)
    ) {
      const map = {
        ...((await API.get(
          "flightAwareAdapter",
          `/flightaware/map/${fa_flight_id}?width=${mapSize}&height=${mapSize}`,
          {}
        )) as { map: string }),
        fetchedDate: new Date(),
      };

      setFlightMaps((flightMaps) => ({
        ...flightMaps,
        [ident]: map,
      }));
    }
  };

  const updateFlightAwareStatuses = async (newFlights: Array<FlightStatus>) => {
    for (const flight of newFlights) {
      const ident = `${flight.marketing_airline_code}${flight.marketing_flight_number}`;

      const scheduledDepartureDateObject =
        flight.Status.ScheduledDepartureDateTime === undefined
          ? flight.StartDateTime
          : flight.Status.ScheduledDepartureDateTime;

      const scheduledArrivalDateObject =
        flight.Status.ScheduledArrivalDateTime === undefined
          ? flight.EndDateTime
          : flight.Status.ScheduledArrivalDateTime;

      const scheduledDepartureDate = new Date(
        scheduledDepartureDateObject.date +
          "T" +
          scheduledDepartureDateObject.time +
          scheduledDepartureDateObject.utc_offset
      );

      const scheduledArrivalDate = new Date(
        scheduledArrivalDateObject.date +
          "T" +
          scheduledArrivalDateObject.time +
          scheduledArrivalDateObject.utc_offset
      );

      const actualDepartureDateObject =
        flight.Status.EstimatedDepartureDateTime;
      const actualArrivalDateObject = flight.Status.EstimatedArrivalDateTime;

      const actualDepartureDate =
        actualDepartureDateObject === undefined
          ? undefined
          : new Date(
              actualDepartureDateObject.date +
                "T" +
                actualDepartureDateObject.time +
                actualDepartureDateObject.utc_offset
            );

      const actualArrivalDate =
        actualArrivalDateObject === undefined
          ? undefined
          : new Date(
              actualArrivalDateObject.date +
                "T" +
                actualArrivalDateObject.time +
                actualArrivalDateObject.utc_offset
            );

      const millisecondsUntilDeparture =
        actualDepartureDate === undefined
          ? millisecondsUntilTime(scheduledDepartureDate)
          : millisecondsUntilTime(actualDepartureDate);

      const millisecondsUntilArrival =
        actualArrivalDate === undefined
          ? millisecondsUntilTime(scheduledArrivalDate)
          : millisecondsUntilTime(actualArrivalDate);

      if (millisecondsUntilDeparture <= 0 && millisecondsUntilArrival > 0) {
        await getFlightAwareStatusForIdent(
          ident,
          scheduledDepartureDate.toISOString(),
          scheduledArrivalDate.toISOString(),
          true
        );
      } else if (
        millisecondsUntilDeparture < 1000 * 60 * 60 * 24 &&
        millisecondsUntilArrival > -60000
      ) {
        await getFlightAwareStatusForIdent(
          ident,
          scheduledDepartureDate.toISOString(),
          scheduledArrivalDate.toISOString(),
          false
        );
      }
    }
  };

  const setupDataRequests = async () => {
    const newFlights = await getFlightsFunction();

    let flightIndexToShow = 0;

    for (const flight of newFlights) {
      if (["303", "403", "407"].includes(flight.Status.flight_status)) {
        flightIndexToShow++;
      } else {
        break;
      }
    }

    if (!accordionGroup.current) {
      return;
    }

    accordionGroup.current.value = [`${flightIndexToShow}`];

    setInterval(() => {
      getFlightsFunction();
    }, 30000);
  };

  useEffect(() => {
    setupDataRequests();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Jonathan's Flights</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Jonathan's Flights</IonTitle>
          </IonToolbar>
        </IonHeader>
        {flights.length === 0 && (
          <IonItem lines="none">
            <IonSpinner name="dots"></IonSpinner>
          </IonItem>
        )}
        <IonAccordionGroup ref={accordionGroup} multiple={true}>
          {flights.map((flight, index) => {
            const ident = `${flight.marketing_airline_code}${flight.marketing_flight_number}`;

            const scheduledDepartureDateObject =
              flight.Status.ScheduledDepartureDateTime === undefined
                ? flight.StartDateTime
                : flight.Status.ScheduledDepartureDateTime;

            const scheduledArrivalDateObject =
              flight.Status.ScheduledArrivalDateTime === undefined
                ? flight.EndDateTime
                : flight.Status.ScheduledArrivalDateTime;

            const scheduledDepartureDate = new Date(
              scheduledDepartureDateObject.date +
                "T" +
                scheduledDepartureDateObject.time +
                scheduledDepartureDateObject.utc_offset
            );

            const scheduledArrivalDate = new Date(
              scheduledArrivalDateObject.date +
                "T" +
                scheduledArrivalDateObject.time +
                scheduledArrivalDateObject.utc_offset
            );

            const actualDepartureDateObject =
              flight.Status.EstimatedDepartureDateTime;
            const actualArrivalDateObject =
              flight.Status.EstimatedArrivalDateTime;

            const actualDepartureDate =
              actualDepartureDateObject === undefined
                ? undefined
                : new Date(
                    actualDepartureDateObject.date +
                      "T" +
                      actualDepartureDateObject.time +
                      actualDepartureDateObject.utc_offset
                  );

            const actualArrivalDate =
              actualArrivalDateObject === undefined
                ? undefined
                : new Date(
                    actualArrivalDateObject.date +
                      "T" +
                      actualArrivalDateObject.time +
                      actualArrivalDateObject.utc_offset
                  );

            const departureDelay =
              actualDepartureDate === undefined ||
              scheduledDepartureDate === undefined
                ? undefined
                : actualDepartureDate.getTime() -
                  scheduledDepartureDate.getTime();

            const arrivalDelay =
              actualArrivalDate === undefined ||
              scheduledArrivalDate === undefined
                ? undefined
                : actualArrivalDate.getTime() - scheduledArrivalDate.getTime();

            const millisecondsUntilDeparture =
              actualDepartureDate === undefined
                ? millisecondsUntilTime(scheduledDepartureDate)
                : millisecondsUntilTime(actualDepartureDate);

            const millisecondsUntilArrival =
              actualArrivalDate === undefined
                ? millisecondsUntilTime(scheduledArrivalDate)
                : millisecondsUntilTime(actualArrivalDate);

            const departureCountdown = durationString(
              millisecondsUntilDeparture
            );

            const arrivalCountdown = durationString(millisecondsUntilArrival);

            // if (
            //   millisecondsUntilDeparture < 0 &&
            //   millisecondsUntilArrival > 0
            // ) {
            //   getFlightAwareStatus(
            //     ident,
            //     scheduledDepartureDate.toISOString(),
            //     scheduledArrivalDate.toISOString(),
            //     true
            //   );
            // } else if (millisecondsUntilArrival < 60000) {
            //   getFlightAwareStatus(
            //     ident,
            //     scheduledDepartureDate.toISOString(),
            //     scheduledArrivalDate.toISOString(),
            //     false
            //   );
            // }

            const shortDateFormatOptions: Intl.DateTimeFormatOptions = {
              month: "short",
              day: "numeric",
            };

            const shortTimeFormatOptions: Intl.DateTimeFormatOptions = {
              hour12: true,
              hour: "2-digit",
              minute: "2-digit",
            };

            const longTimeFormatOptions: Intl.DateTimeFormatOptions = {
              hour12: true,
              hour: "2-digit",
              minute: "2-digit",
              timeZoneName: "short",
            };

            const longDateTimeFormatOptions: Intl.DateTimeFormatOptions = {
              hour12: true,
              hour: "2-digit",
              minute: "2-digit",
              timeZoneName: "short",
              month: "short",
              day: "numeric"
            };
            return (
              <IonAccordion value={`${index}`} key={index}>
                <IonItem slot="header" color="light">
                  <IonLabel>
                    {scheduledDepartureDate.toLocaleDateString(
                      "en-US",
                      shortDateFormatOptions
                    )}{" "}
                    | {flight.start_airport_code} - {flight.end_airport_code}
                  </IonLabel>
                  <IonBadge
                    color={flightStatuses[flight.Status.flight_status].color}
                  >
                    {flightStatuses[flight.Status.flight_status].statusText}
                  </IonBadge>
                </IonItem>

                <IonGrid
                  slot="content"
                  className="ion-padding"
                  style={{ "--ion-grid-padding": "0px" }}
                >
                  <IonRow>
                    <IonCol>
                      <IonGrid
                        className="ion-no-padding"
                        style={{ "--ion-grid-padding": "0px" }}
                      >
                        <IonRow>
                          <IonCol>
                            <h5 className="ion-no-margin">
                              {flight.marketing_airline}{" "}
                              {flight.marketing_flight_number}
                            </h5>
                            <p className="ion-no-margin">
                              {ident}{" "}
                              <a
                                role="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(ident);
                                }}
                              >
                                <IonIcon icon={clipboardOutline}></IonIcon>
                              </a>
                            </p>
                          </IonCol>
                          <IonCol class="ion-text-end">
                            <IonThumbnail>
                              <img src={`assets/airline-logos/${IATAToICAO[flight.marketing_airline_code]}.png`} />
                            </IonThumbnail>
                          </IonCol>
                        </IonRow>
                        <br />
                        <IonRow>
                          <IonCol>
                            <IonText
                              color={
                                flightStatuses[flight.Status.flight_status]
                                  .color
                              }
                            >
                              <h3 className="ion-no-margin">
                                {
                                  flightStatuses[flight.Status.flight_status]
                                    .longStatusText
                                }
                              </h3>
                              {millisecondsUntilDeparture > 0 ? (
                                <h1 className="ion-no-margin">
                                  Departing in {departureCountdown}
                                </h1>
                              ) : millisecondsUntilArrival > 0 ? (
                                <h1 className="ion-no-margin">
                                  Arriving in {arrivalCountdown}
                                </h1>
                              ) : (
                                <></>
                              )}
                            </IonText>
                          </IonCol>
                        </IonRow>
                        <br />
                        <IonRow>
                          <IonCol>
                            <p className="ion-no-margin">Departure</p>
                            <h1 className="ion-no-margin">
                              {flight.start_airport_code}
                            </h1>
                            <h4 className="ion-no-margin">
                              {flight.start_city_name}
                            </h4>
                            <p className="ion-no-margin">
                              {flight.Status.departure_terminal && (
                                <span>
                                  Terminal {flight.Status.departure_terminal}
                                </span>
                              )}
                              {flight.Status.departure_gate && (
                                <span>
                                  , Gate {flight.Status.departure_gate}
                                </span>
                              )}
                            </p>
                            <p className="ion-no-margin">
                              <small>Scheduled</small>
                            </p>
                            <p className="ion-no-margin">
                              {scheduledDepartureDate.toLocaleTimeString(
                                "en-US",
                                {
                                  ...longTimeFormatOptions,
                                  timeZone:
                                    scheduledDepartureDateObject.timezone,
                                }
                              )}
                            </p>
                            {actualDepartureDate && (
                              <>
                                <p className="ion-no-margin">
                                  <small>Actual</small>
                                </p>
                                <p className="ion-no-margin">
                                  <IonText
                                    color={
                                      departureDelay !== undefined &&
                                      departureDelay <= 0
                                        ? "success"
                                        : "danger"
                                    }
                                  >
                                    {actualDepartureDate.toLocaleTimeString(
                                      "en-US",
                                      {
                                        ...longTimeFormatOptions,
                                        timeZone:
                                          scheduledDepartureDateObject.timezone,
                                      }
                                    )}
                                  </IonText>
                                </p>
                              </>
                            )}
                            {departureDelay && departureDelay !== 0 ? (
                              <p className="ion-no-margin">
                                <small>
                                  {durationString(departureDelay)}{" "}
                                  {departureDelay < 0 ? "early" : "late"}
                                </small>
                              </p>
                            ) : (
                              <p>
                                <small></small>
                              </p>
                            )}
                            <p>Duration: {flight.duration}</p>
                          </IonCol>
                          <IonCol class="ion-text-end">
                            <p className="ion-no-margin">Arrival</p>
                            <h1 className="ion-no-margin">
                              {flight.end_airport_code}
                            </h1>
                            <h4 className="ion-no-margin">
                              {flight.end_city_name}
                            </h4>
                            {flight.Status.arrival_terminal && (
                              <span>
                                Terminal {flight.Status.arrival_terminal}
                              </span>
                            )}
                            {flight.Status.arrival_gate && (
                              <span>, Gate {flight.Status.arrival_gate}</span>
                            )}
                            <p className="ion-no-margin">
                              <small>Scheduled</small>
                            </p>
                            <p className="ion-no-margin">
                              {scheduledArrivalDate.toLocaleTimeString(
                                "en-US",
                                {
                                  ...longTimeFormatOptions,
                                  timeZone: scheduledArrivalDateObject.timezone,
                                }
                              )}
                            </p>
                            {actualArrivalDate && (
                              <>
                                <p className="ion-no-margin">
                                  <small>Actual</small>
                                </p>
                                <p className="ion-no-margin">
                                  <IonText
                                    color={
                                      arrivalDelay !== undefined &&
                                      arrivalDelay <= 0
                                        ? "success"
                                        : "danger"
                                    }
                                  >
                                    {actualArrivalDate.toLocaleTimeString(
                                      "en-US",
                                      {
                                        ...longTimeFormatOptions,
                                        timeZone:
                                          scheduledArrivalDateObject.timezone,
                                      }
                                    )}
                                  </IonText>
                                </p>
                              </>
                            )}
                            {arrivalDelay && arrivalDelay !== 0 ? (
                              <p className="ion-no-margin">
                                <small>
                                  {durationString(arrivalDelay)}{" "}
                                  {arrivalDelay < 0 ? "early" : "late"}
                                </small>
                              </p>
                            ) : (
                              <p>
                                <small></small>
                              </p>
                            )}
                            {flight.Status.baggage_claim && (
                              <p>Baggage Claim {flight.Status.baggage_claim}</p>
                            )}
                          </IonCol>
                        </IonRow>
                        <IonRow>
                          <IonCol>
                            <IonButton
                            shape="round"
                              onClick={async () => {
                                const departureDateTimeString =
                                  actualDepartureDate
                                    ? actualDepartureDate.toLocaleTimeString(
                                        "en-US",
                                        {
                                          ...(dateObjectsAreSameDay(actualDepartureDate, new Date()) ? longTimeFormatOptions : longDateTimeFormatOptions),
                                          timeZone:
                                            scheduledDepartureDateObject.timezone,
                                        }
                                      )
                                    : scheduledDepartureDate.toLocaleTimeString(
                                        "en-US",
                                        {
                                          ...(dateObjectsAreSameDay(scheduledDepartureDate, new Date()) ? longTimeFormatOptions : longDateTimeFormatOptions),
                                          timeZone:
                                            scheduledDepartureDateObject.timezone,
                                        }
                                      );

                                const arrivalDateTimeString = actualArrivalDate
                                  ? actualArrivalDate.toLocaleTimeString(
                                      "en-US",
                                      {
                                        ...(dateObjectsAreSameDay(actualArrivalDate, new Date()) ? longTimeFormatOptions : longDateTimeFormatOptions),
                                        timeZone:
                                          scheduledArrivalDateObject.timezone,
                                      }
                                    )
                                  : scheduledArrivalDate.toLocaleTimeString(
                                      "en-US",
                                      {
                                        ...(dateObjectsAreSameDay(scheduledArrivalDate, new Date()) ? longTimeFormatOptions : longDateTimeFormatOptions),
                                        timeZone:
                                          scheduledArrivalDateObject.timezone,
                                      }
                                    );

                                const shareData = {
                                  title: `Jonathan Damico's Flight`,
                                  text: `${ident}\n${
                                    flightStatuses[flight.Status.flight_status]
                                      .longStatusText
                                  }\nDep ${departureDateTimeString} @ ${
                                    flight.start_airport_code
                                  }${
                                    flight.Status.departure_terminal
                                      ? ` Terminal ${flight.Status.departure_terminal}`
                                      : ""
                                  }${
                                    flight.Status.departure_gate
                                      ? ` Gate ${flight.Status.departure_gate}`
                                      : ""
                                  }\nArr ${arrivalDateTimeString} @ ${
                                    flight.end_airport_code
                                  }${
                                    flight.Status.arrival_terminal
                                      ? ` Terminal ${flight.Status.arrival_terminal}`
                                      : ""
                                  }${
                                    flight.Status.arrival_gate
                                      ? ` Gate ${flight.Status.arrival_gate}`
                                      : ""
                                  }${
                                    flight.Status.baggage_claim
                                      ? ` Baggage Claim ${flight.Status.baggage_claim}`
                                      : ""
                                  }`,
                                };

                                try {
                                  await navigator.share(shareData);
                                } catch (err) {
                                  navigator.clipboard.writeText(
                                    shareData.text + " \njdami.co/flights"
                                  );
                                  presentToast("Copied to clipboard", "top");
                                }
                              }}
                            >
                              Share Details
                            </IonButton>
                            {flightAwareStatuses[ident] &&
                              flightAwareStatuses[ident].status && (
                                <>
                                  {flightAwareStatuses[ident].status
                                    .fa_flight_id && (
                                    <IonButton
                                      shape="round"
                                      href={`https://flightaware.com/live/flight/id/${flightAwareStatuses[ident].status.fa_flight_id}`}
                                    >
                                      Track on FlightAware
                                    </IonButton>
                                  )}
                                  {flightAwareStatuses[ident].status
                                    .inbound_fa_flight_id && (
                                    <IonButton
                                      shape="round"
                                      href={`https://flightaware.com/live/flight/id/${flightAwareStatuses[ident].status.inbound_fa_flight_id}`}
                                    >
                                      Track Inbound Flight on FlightAware
                                    </IonButton>
                                  )}
                                </>
                              )}
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCol>
                    <IonCol size="auto">
                      {flightMaps[ident] && (
                        <IonRow>
                          <IonCol>
                            <IonThumbnail style={{ "--size": `${mapSize}px` }}>
                              <IonImg
                                src={`data:image/png;base64,${flightMaps[ident].map}`}
                              />
                            </IonThumbnail>
                          </IonCol>
                        </IonRow>
                      )}
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonAccordion>
            );
          })}
        </IonAccordionGroup>
        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
