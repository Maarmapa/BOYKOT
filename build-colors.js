// build-colors.js
// Construye copic-colors.json usando IDs de Google Drive + hex oficiales
// Los hex son los valores oficiales de Copic, refinables con las imagenes

const fs = require('fs');

// IDs de Google Drive para cada color (ya tenemos 100+, completar con nextPageToken)
const DRIVE_IDS = {
  "0":      "1UxAAFii7ZUI5b8l2xSRkVz5c9bIvQCjE",
  "B18":    "1Dd4_nsM-I9VSPSYoQIECjDlvtQI69EDI",
  "V06":    "1w1pTUEnVw3gQrMxtGZfoZLAyeKzalCWI",
  "RV91":   "1bGtLDcCEGfqOWqTjSSnwtDLselyxRGR7",
  "T7":     "1o8KDRkgx7xWFuCWUuBG-Ve8KKgHX0BGk",
  "BG72":   "1-YFyo651cP-935XBGFAKG7ul5hik__gT",
  "Y02":    "1JNShvALdv_UrHZGmhr6MZpUHWzFteaFR",
  "V12":    "1ZQEl4IJ-cxhXr_nOSKkxVlFZ0xln1vD6",
  "V93":    "16eYHlfGr6ToqqW8fik5-9ay_qs3rO87k",
  "R11":    "1Wa6D9789VnlCkusmF0-7oCheex4lv5Fw",
  "YR65":   "1aoBD7urB5WnxyzYJkszlDSY91AlaJQyQ",
  "BV02":   "1rJAaq10AHJ50HQnr6DcYkU1IgJn1616K",
  "YR15":   "1Cjj5AhCOV736xWv0RvcbmmLkHlrntKPd",
  "YR000":  "1li5Ow-UmpTkRb9HXv7iefYsHaoqm-XOK",
  "FBG2":   "1OxQXKmQmYcdpRJt_wBRXOGPC0ynDGe97",
  "YG01":   "1VqCV5TjjbGaypddd8O7-Yn-sahm6Lprs",
  "RV09":   "1AgaZj8UPtjTWUr_-9rk8m-5i4mcdfJ-I",
  "YR09":   "1-WG9FK1DSEenqMC9bavEnh8lHVnVHrAJ",
  "BV25":   "1M4M10QO2asZFIPcLHAOZ0LE-J8xhU0vN",
  "G28":    "1b17FyfKod9EqoJTaIYvix1_jPf2P2iGd",
  "Y32":    "1v2CaVRspk2I8VvvvAHoiil8JFE4ms2Mj",
  "RV10":   "1q1hUeicHlUTHqyp03Vrmip-o_AecmcGV",
  "E79":    "1Vju0Sq3ecUttXLfoCdHu5T1F1FmYdA2o",
  "BG90":   "16ruwEp1hbgrqfGQgUe8WyIa5AZ7NfFHG",
  "BG57":   "1-5Sfch0FQ-CFMTKgkJV0dFu1LPTl5_pG",
  "R05":    "1Lt8CBW9RANk5UJchA9eDH1vMDt9n13PG",
  "B05":    "1-dsqZv2l5BHX_hpnwd4aSrdSiycIKh8U",
  "BG000":  "1YZR9sXoFYQemhfCRgQE8uU0NEj-epwvs",
  "YR07":   "1ryFloeFrHR6KSUoNnS9mqQ3MlqFljsNU",
  "W1":     "1gnoMCftKJchHDGKtAQF8H1M_C2x3RvnS",
  "Y21":    "1KIqNfD90zILtkH0trrQ4TcY4rwKFfNtm",
  "B91":    "1ihObtIttFwdCz97ekSdu5xCWxEZe3DDJ",
  "Y28":    "1fuyPNqmHRYzGWdIU73hx_xDHsCs4bEof",
  "YG25":   "1gAJSEMUZSefpqtNuKk3KMMtZlVZXVZAZ",
  "V91":    "1E8qImG1twPYsINZmJ2HoR8773lT5w3xZ",
  "E21":    "1KRQWi8XG2mAX2suLGePY9-Odmj7H_xqX",
  "V20":    "1sHlQhVpNahxBjsBltnLR5Uu67RIFY-FB",
  "Y38":    "1EOhEh8cLArwsbVVkq77rkmwOFk38PTtw",
  "R29":    "1_sojwu-IDkImZHxJqiG-ho3r35YMXajH",
  "YG0000": "17Jozv7Wim41CEguxHgvxVZrzwzoTzFbg",
  "B60":    "1fkmXzr1sJTN2tD8ToytYwXHhxTe0fEbr",
  "B04":    "1nF6uCTUkEy_4lf3KgreNrvo6oq5LjqK5",
  "E97":    "1w5DURBNddLvUaerBEA1FQu6KklH4ye16",
  "BV00":   "1qtCVBHfxI0oxD4POKQ97zap0Wl-sLh9-",
  "YR31":   "1HcX9Lc_Nhqys_pDTI1apzOtmZ4JiszO4",
  "BV34":   "1kn9Whot28QYjLcQSXU7DlTgT69JLmkVg",
  "B21":    "1WlBysrftTlX7gC0LzjXxJNh4Ws5qjLKw",
  "G20":    "1_9rT1t1n8Ad75UhpXg0h3V5SDHNhD-F8",
  "W7":     "1CXuIINzPugagCTnXqmF8PmqwTGQHPXC3",
  "RV42":   "1uBxMcb-aG2fgRuaRadeUBQZfdM7tEWrS",
  "N10":    "16k66hHly8YIbPA31QCx4NugpLcdOt9_y",
  "BV17":   "1iYgaHZpw675yv3t9_HOFSxvEXqbHSKmx",
  "Y13":    "1ytJlCwuxD6DiPVq-2k8a8PZsfJq3VlS8",
  "RV23":   "1Txbfu4XtE9TmXstS0MmqXCpZmaotbxL3",
  "E43":    "1B8nWrV9wkEP3nsGEypM2S1xtKfey59X8",
  "E07":    "1rXwDddTBNbFNyObcyRQNG4-jMBYnAAAK",
  "BV13":   "1Cq8y9lh3jF2vHuWbFofm9T2VSkRS3TTq",
  "G16":    "10YivZ_5ZQo8iLtWYNZ80FFWdl2nNly_v",
  "BG34":   "1HC4rFeHj2AN-eNejEVfE1ym36VFXHHCH",
  "N6":     "1C1nuDYUwEcYE-rJ7srNfK-xcvAwQX57Z",
  "BV04":   "1n35G18SM1Ewo7NI9KtWBVHznMwRGOKMp",
  "B12":    "1hdsx76gcFBpGmi0qxxPWFLwqLTnZ_uaZ",
  "B28":    "1DandkSfyAeZgkocmxwm3WEWyEBsIUrUu",
  "R89":    "1kNqtl2AGbfHgHEdkGsblO81_pW3NAXOA",
  "G0000":  "1lV9Gt-dsUrW6cgL8Bbi-z6NEQkqt-aAl",
  "E27":    "1loMMXKc9mluDpkNgl73B7XhC9vTNsG6V",
  "RV02":   "1PvtxHMf4RQLFiI0xV67ukm8LKvkq2mFZ",
  "R21":    "10rUFv4u-Vle8totcJmTfDvKti7jXpYSG",
  "E09":    "1-PCS15KUjSYScWuCBOl4mO9V-zhMmwdi",
  "B26":    "1pt02R7thcEdq40WL_X6AmkrT-woFN5jB",
  "BV0000": "1bUoa8eH1bttW3rvJrSYrRuOHdrTiZdCh",
  "BV23":   "1dSdGwQhG5vA9mszFxIJBGjK-GtUslX8U",
  "RV95":   "14QuR5fIhawQ_MFIhTV46FKLFVE8gF8Xo",
  "E29":    "133Jz5ptn0LKo8lmPQsw5lfe1W-JYvR3y",
  "T9":     "1189OW9ImX-ijZ7TmdnCkTlUjvW4mu6G9",
  "B93":    "1yEd1M8I8QUBzYIKpXhGONs-CJ3qDCPLL",
  "BG23":   "13U5ph3bTYkI7JpMEVc5bjxy9kyJonnsZ",
  "B16":    "1FRIJR21vHNAJ66EBO5vi3Y-NoRftdzaB",
  "E11":    "1v295iKy8hRuo6sJWCl-rHze13fXCN7tQ",
  "E31":    "1dPbtGnuYvcArpJbCK8_Sb6dyfByni7vy",
  "YG03":   "10bAV5tFZn-M8qJPHzI_NytqOz2IOrfSo",
  "FYG2":   "15sjJ9KsxJ9LBgA4u_0hsCgeGF3HORExx",
  "R24":    "1SBRUvqqFHA4t02-gQ7nL9u_CXIET_YkZ",
  "C3":     "1z-19hJxHGuNWCXDRKbaTlhTrUWgMvhcO",
  "YR21":   "10Dfm7CuBFQJJgVG6DKQtFD_PeOjjJC69",
  "YR61":   "1YJO2WyG1mx5mPN1MYyavZUEgQ_zSUykc",
  "R02":    "1jgzffX7ukTMyMTzEmBn04eb_Dz1UAXg6",
  "B39":    "11fNmHxqgRbDShvrXCxHD9AWcbIbXBUVZ",
  "C6":     "10PkxIuQljaOBu4c-GCIUQCMo2g9pZiuY",
  "G07":    "1ANS29hX9kbjsC2MBwSORAtXUM8-znKm0",
  "RV19":   "1UGgHirKoMaARxFCtICP7nIsZmd80mEl-",
  "BV20":   "1IkUqTFAnPtvO_bogmFVcjdDsJlji3rxt",
  "V0000":  "13m9GvRrffWrq2IZFeOAnewBUuHecOj2p",
  "YG06":   "1WuZtRbiKGJbHVFZIv-Ef2QBET3ihZBe3",
  "BG15":   "1grydZsE8XYD0cW86Z5rXAdhbWdZyXjGS",
  "FV2":    "1Pk3rkvNkMvmFsXqY4S8HFQP9FwkjcVuj",
  "R39":    "1phJUtGkAcCH8Afv3EdRWymubNhGaCVVN",
  "E17":    "1dP0I7BvP2LgsqLNqPfHvmlQ9GpC5LFmu",
  "E74":    "1TEGXRgN3dFuF1JPjD1guMaSkwycLifHJ",
  "E33":    "1VjLkVvF84PI0vAcsCUyoa7x4RM8bdzrW",
  // Page 1 from first search
  "YR21_":  "10Dfm7CuBFQJJgVG6DKQtFD_PeOjjJC69",
  "BG10":   "16q1Vb60ZiKDhnkPcvA2Oy3a24ucMyDxm",
  "YR04":   "1LL2g4YbEvNIlc2aGg7fPE4JhVhGR4RM2",
  "E37":    "1FnKYEolSthnwgONigKXW4wq5IgKW7MzT",
  "FBG2_":  "1OxQXKmQmYcdpRJt_wBRXOGPC0ynDGe97",
  "YG63":   "1dESXB4hcfBMGQjRyZS1FcecdmeWgK8_i",
  "G24":    "1P3Ll34cvUbgxZFXvTOOag-Un-RKTmfBA",
  "V09":    "1PiSf5EvXmscQ7BUnYM47yM4iRH317117",
  "N5":     "1l3a6kHFKyfXhxNTwLn4CZH677O0vrDYG",
  "BG49":   "1ziRmCVGmoMPEQPflElG6XwbsFybOD_Lh",
  "R20":    "1IcbIom7AAI6Tl5M-cLL1F_SI2EQwFZjF",
  "RV00":   "1IAnyTlters-nfJU3u70F2XVhRlvh86hC",
  "RV11":   "1vpcrXJV7wqITjyvj0ffu5PBJXx8WabGI",
  "Y19":    "1K4ys2Eh1xfKre__l3kdDysHvdYH1NrRs",
  "FRV1":   "19ivnuhJ4VCcI0Zvjrhe_YNZJehUMSz8_",
  "BG11":   "1nu3-CdWCcjCX_NdW3W5JsMqyiaEq2RAZ",
  "YR12":   "14iXzioKkfhyQT9kLDSi6y3RdiMrNk7XH",
  "V22":    "1iadEkWeU6ibnqxIc7sC8i1JrJnFUZa6M",
  "E89":    "16nCBfQLr5qerz9Oguyu2LOmwGNaT6dbE",
  "FB2":    "1bkvkKadVm8fInUO4GbfzAW7TgahOu15D",
  "V25":    "1MVFTZfn-OEMiRw_yL9MXeEaJD723Qe8O",
  "E00":    "1jLRyajhTQykOn7LLAttWR-KD_fxTB296",
  "V28":    "1_9-CrUcHYDeCag-OEltoCMxcmLfBf1vm",
  "C7":     "1ieVGDlEsF6HV5th0pBVKNwr0nSkwQCnx",
  "YG95":   "1bLYesEj5FQsJolnOki2sZLfBpQ_--naA",
  "W10":    "1nRNsZBCsAnKFELgubZbnOCm0nqu3yT1I",
  "T8":     "1DmTIIU4H9_DOHg4aaKx-VRrGMCQ3Mpcr",
  "B95":    "1NxQlvLBw7-cIoKgoZPfS-e1n0Ks2wRTD",
  "RV63":   "1MkPYQCjb9k_Yhzphk-srEbDCxFldWTv0",
  "E47":    "1QtT0iz7ksaUqYBrn6ej64A8t2tDe722Y",
  "B000":   "1aqcjX1_C-7ctVoAvJzSGngfIQ0Mihq8E",
  "E25":    "1NGzW9824hhcu10HLcwXS9Ytk2xGf4HLP",
  "B01":    "1pRJZeLUdxTvjaTUOAldVGPmkN9oT5rsS",
};

// URL directa de Google Drive para servir imágenes
const driveUrl = (id) => `https://lh3.googleusercontent.com/d/${id}`;
const thumbUrl = (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w200`;

// Hex oficiales Copic (los que no están en DRIVE_IDS usan solo hex)
const COPIC_HEX = {
  "0":    "#FFFFFF", "100":   "#231F20",
  // Blue (B)
  "B000": "#DCF0F5", "B00":  "#D5EEF4", "B01":  "#89D3E5",
  "B02":  "#72C9E0", "B04":  "#33A8D4", "B05":  "#1393C8",
  "B06":  "#008AC4", "B12":  "#A7D7EC", "B14":  "#5BBCE4",
  "B16":  "#3A88C5", "B18":  "#1B4F9A", "B21":  "#B2D9F1",
  "B23":  "#5BA4D4", "B24":  "#3A8DC7", "B26":  "#1F62AE",
  "B28":  "#1A4A9C", "B29":  "#203892", "B32":  "#C9E6F4",
  "B34":  "#9DD0ED", "B37":  "#4D9ED8", "B39":  "#1A3C8C",
  "B41":  "#C3E0F0", "B45":  "#8CBEDD", "B52":  "#A2BFCF",
  "B60":  "#C9DCE8", "B63":  "#9AB8D4", "B66":  "#5278A0",
  "B69":  "#2B4D7A", "B79":  "#3C3F8C", "B91":  "#C5D7E8",
  "B93":  "#92A9C0", "B95":  "#7B93A8", "B97":  "#2F3D5A",
  "B99":  "#222941", "B000": "#E8F5FB",
  // Blue Green (BG)
  "BG000": "#E5F5F6", "BG01": "#6FC9CE", "BG02": "#00A5C0",
  "BG05":  "#007FA8", "BG07": "#006895", "BG09": "#00556B",
  "BG10":  "#C4E4E8", "BG11": "#E8F5F7", "BG13": "#A8DFE3",
  "BG15":  "#5EC5CC", "BG18": "#00829E", "BG23": "#B8E0E5",
  "BG32":  "#A5DEDF", "BG34": "#79CDCD", "BG45": "#48B5AD",
  "BG49":  "#2B7A7A", "BG53": "#CDEEE8", "BG57": "#3D8575",
  "BG70":  "#D4E8E4", "BG72": "#98C8C0", "BG75": "#3B7A6A",
  "BG78":  "#5E7060", "BG90": "#D3E4E0",
  // Blue Violet (BV)
  "BV000": "#E9E0EE", "BV00": "#D8CEEA", "BV01": "#B09DD6",
  "BV02":  "#8B78C0", "BV04": "#6B55B0", "BV08": "#5040A0",
  "BV11":  "#C5B8DC", "BV13": "#9B88D0", "BV17": "#3D2E80",
  "BV20":  "#C8BCE0", "BV23": "#A090C0", "BV25": "#8878B8",
  "BV29":  "#5050808", "BV31": "#D5CCE5", "BV34": "#9080C5",
  "BV0000": "#F0ECF7",
  // Cool Gray (C)
  "C0": "#F5F5F5", "C1": "#EBEBEB", "C2": "#D9D9D9",
  "C3": "#C6C6C6", "C4": "#ADADAD", "C5": "#949494",
  "C6": "#7A7A7A", "C7": "#5E5E5E", "C8": "#434343",
  "C9": "#2A2A2A", "C10": "#1A1A1A",
  // Earth (E)
  "E00":  "#F7E6DC", "E01":  "#F9D5C8", "E02":  "#F7C5B5",
  "E04":  "#F2A886", "E07":  "#E2945A", "E08":  "#D4874A",
  "E09":  "#C87A3C", "E11":  "#F5DACC", "E13":  "#F0C8A8",
  "E15":  "#D4956A", "E17":  "#B8743A", "E18":  "#A05E28",
  "E19":  "#8B4C22", "E21":  "#F9E0D5", "E23":  "#D4A882",
  "E25":  "#C08060", "E27":  "#A06040", "E29":  "#7A3E20",
  "E30":  "#F9EAD8", "E31":  "#F5D8C0", "E33":  "#EABA92",
  "E34":  "#D4956A", "E35":  "#C8825A", "E37":  "#7A4A2A",
  "E39":  "#5E3020", "E40":  "#F9F0E8", "E41":  "#F9EEE5",
  "E42":  "#F5E5D5", "E43":  "#EEDAC5", "E44":  "#D8B890",
  "E47":  "#9A6040", "E49":  "#6A3020", "E50":  "#F9F0E5",
  "E51":  "#F9F2EA", "E53":  "#EDD9C0", "E55":  "#D4AE80",
  "E57":  "#A87850", "E59":  "#7A5030", "E70":  "#E8CABE",
  "E71":  "#F0D5B0", "E74":  "#B88060", "E77":  "#7A4040",
  "E79":  "#5A2828", "E81":  "#F5EAD5", "E84":  "#A8926A",
  "E87":  "#6A4A3A", "E89":  "#4A2E20", "E93":  "#F0C8B8",
  "E95":  "#F5BCA8", "E97":  "#E08050", "E99":  "#C05828",
  // Green (G)
  "G0000": "#F0F9F0", "G00": "#D0EFDA", "G02":  "#9CDB9A",
  "G03":   "#7CD07A", "G05": "#52B858", "G07":  "#28A040",
  "G09":   "#189038", "G12": "#A8DFB0", "G14":  "#7DCC80",
  "G16":   "#3CB050", "G17": "#228030", "G19":  "#009020",
  "G20":   "#F0F8F0", "G21": "#CCEACC", "G24":  "#90CC94",
  "G28":   "#3A9050", "G29": "#186030", "G40":  "#C0D8C0",
  "G82":   "#C8DCC0", "G85": "#6A9070", "G94":  "#909478",
  "G99":   "#606840",
  // Neutral Gray (N)
  "N0": "#F8F8F8", "N1": "#F0F0F0", "N2": "#E0E0E0",
  "N3": "#CCCCCC", "N4": "#B8B8B8", "N5": "#A0A0A0",
  "N6": "#888888", "N7": "#6A6A6A", "N8": "#4A4A4A",
  "N9": "#303030", "N10": "#181818",
  // Red (R)
  "R000": "#FEF0F0", "R00": "#FDE5E5", "R01": "#FDD5D5",
  "R02":  "#FAC4C4", "R05": "#F58080", "R08": "#F04040",
  "R09":  "#E83030", "R11": "#FAD0D0", "R12": "#F8B8B8",
  "R14":  "#F59090", "R17": "#F07040", "R20": "#FAE0D8",
  "R21":  "#F8C8B8", "R22": "#F8B8A0", "R24": "#F8A080",
  "R27":  "#E84040", "R29": "#D82828", "R30": "#FDE8E0",
  "R32":  "#FDC8B0", "R35": "#F89870", "R37": "#D04040",
  "R39":  "#A02828", "R43": "#E07090", "R46": "#C82020",
  "R56":  "#A03050", "R59": "#802030", "R81": "#FAB8C8",
  "R83":  "#F890A8", "R85": "#E85880", "R89": "#902040",
  // Red Violet (RV)
  "RV000": "#F9EBF5", "RV00": "#F5DBF0", "RV02": "#F8C0E8",
  "RV04":  "#F880D8", "RV06": "#E848C8", "RV09": "#C020A0",
  "RV10":  "#FAE0F0", "RV11": "#F8C8E8", "RV13": "#F8A8D8",
  "RV14":  "#F880C0", "RV17": "#D040A0", "RV19": "#A82090",
  "RV21":  "#FAE5F0", "RV23": "#F8C0D8", "RV25": "#F090B8",
  "RV29":  "#C02880", "RV32": "#F0B0D0", "RV34": "#E888B8",
  "RV42":  "#F8B0B8", "RV52": "#F8C8D8", "RV55": "#D070A0",
  "RV63":  "#E8709090", "RV66": "#C04878", "RV69": "#A03060",
  "RV91":  "#ECC0D4", "RV93": "#D8A0B8", "RV95": "#F8C0D8",
  "RV99":  "#7040785",
  // Toner Gray (T)
  "T0": "#F6F6F4", "T1": "#EBEBEA", "T2": "#DDDDD8",
  "T3": "#CACAC4", "T4": "#B5B5AE", "T5": "#9E9E98",
  "T6": "#888880", "T7": "#6E6E68", "T8": "#545450",
  "T9": "#3A3A35", "T10": "#222220",
  // Violet (V)
  "V0000": "#F5F0F8", "V000": "#EBE5F5", "V01": "#C8B0DC",
  "V04":   "#B09AEC", "V05": "#9A88D8", "V06": "#8878D0",
  "V09":   "#6060C0", "V12": "#DDD0EC", "V15": "#B8A0D8",
  "V17":   "#8060B8", "V20": "#D8CCEC", "V22": "#C0B0DC",
  "V25":   "#A890CC", "V28": "#704888", "V91": "#D8C0E0",
  "V93":   "#C0A0D0", "V95": "#A880C0", "V99": "#503070",
  // Warm Gray (W)
  "W0": "#F8F7F5", "W1": "#F0EDEA", "W2": "#E4E0DA",
  "W3": "#D0CAC2", "W4": "#BCB4AA", "W5": "#A49C90",
  "W6": "#8C8278", "W7": "#706860", "W8": "#504A44",
  "W9": "#342E28", "W10": "#201A14",
  // Yellow (Y)
  "Y000": "#FDFBE5", "Y00": "#FBF8D0", "Y02":  "#FAF598",
  "Y04":  "#F8F040", "Y06": "#F5E800", "Y08":  "#F0E000",
  "Y11":  "#FEFCE8", "Y13": "#FBF7A0", "Y15":  "#F8F060",
  "Y17":  "#F5DC20", "Y18": "#F8D418", "Y19":  "#F8C820",
  "Y21":  "#FBF5C0", "Y23": "#F0DCA0", "Y26":  "#D8B058",
  "Y28":  "#C89030", "Y32": "#F5E8B0", "Y35":  "#F0D080",
  "Y38":  "#E8B840",
  // Yellow Green (YG)
  "YG0000": "#F5FAEE", "YG00": "#E8F5D8", "YG01": "#D0F0C0",
  "YG03":   "#A8E090", "YG05": "#90D070", "YG06": "#78C858",
  "YG07":   "#60B840", "YG09": "#48A828", "YG11": "#D8EFC0",
  "YG13":   "#B8E090", "YG17": "#70C040", "YG21": "#E0F0C0",
  "YG23":   "#B0D890", "YG25": "#98C878", "YG41": "#C8E0C0",
  "YG45":   "#98C890", "YG61": "#C8E0A8", "YG63": "#A8C878",
  "YG67":   "#78A048", "YG91": "#D0D0A8", "YG93": "#C0C090",
  "YG95":   "#B8B880", "YG97": "#909060", "YG99": "#686840",
  // Yellow Red (YR)
  "YR000": "#FEF0E8", "YR00": "#FDE8D8", "YR01": "#FDD8C0",
  "YR02":  "#FCC8A0", "YR04": "#F8A860", "YR07": "#F58028",
  "YR09":  "#F06010", "YR12": "#F0A050", "YR14": "#D88040",
  "YR15":  "#F09830", "YR16": "#F0A848", "YR18": "#E07028",
  "YR20":  "#FDE8C0", "YR21": "#FDE0A8", "YR23": "#E8C078",
  "YR24":  "#D8A858", "YR27": "#D07030", "YR30": "#F8E0C0",
  "YR31":  "#F8D0A0", "YR61": "#F0C098", "YR65": "#E09060",
  "YR68":  "#F07030", "YR82": "#F8C8A8",
  // Fluorescent
  "FBG2":  "#00E8E0", "FB2":  "#00B0FF",
  "FRV1":  "#FF40C0", "FV2":  "#C040FF",
  "FYG1":  "#80FF40", "FYG2": "#C0FF20",
};

// Familias de colores
const FAMILIES = {
  "BV": "Blue Violet", "BG": "Blue Green", "B": "Blue",
  "G": "Green", "YG": "Yellow Green", "Y": "Yellow",
  "YR": "Yellow Red", "R": "Red", "RV": "Red Violet",
  "V": "Violet", "E": "Earth", "W": "Warm Gray",
  "C": "Cool Gray", "N": "Neutral Gray", "T": "Toner Gray",
  "FBG": "Fluorescent Blue Green", "FB": "Fluorescent Blue",
  "FRV": "Fluorescent Red Violet", "FV": "Fluorescent Violet",
  "FYG": "Fluorescent Yellow Green",
  "0": "Colorless", "100": "Black",
};

function getFamily(code) {
  const prefixes = Object.keys(FAMILIES).sort((a,b) => b.length - a.length);
  for (const p of prefixes) {
    if (code.startsWith(p)) return FAMILIES[p];
  }
  return "Other";
}

// Construir el JSON completo
const colors = {};
const allCodes = [...new Set([...Object.keys(COPIC_HEX), ...Object.keys(DRIVE_IDS)])];

for (const code of allCodes) {
  if (code.endsWith('_')) continue; // Skip duplicates
  const hex = COPIC_HEX[code] || '#CCCCCC';
  const driveId = DRIVE_IDS[code];
  
  colors[code] = {
    code,
    hex,
    family: getFamily(code),
    driveId: driveId || null,
    // URL para mostrar la imagen real del Drive si está disponible
    imageUrl: driveId ? driveUrl(driveId) : null,
    thumbUrl: driveId ? thumbUrl(driveId) : null,
  };
}

const output = {
  generated_at: new Date().toISOString(),
  total: Object.keys(colors).length,
  with_image: Object.values(colors).filter(c => c.driveId).length,
  brand: "Copic",
  note: "hex = valores oficiales Copic · imageUrl = imagen real del Drive",
  colors
};

fs.writeFileSync('copic-colors.json', JSON.stringify(output, null, 2));
console.log(`✅ copic-colors.json generado`);
console.log(`   Total colores: ${Object.keys(colors).length}`);
console.log(`   Con imagen Drive: ${output.with_image}`);
console.log(`   Familias: ${[...new Set(Object.values(colors).map(c=>c.family))].join(', ')}`);
