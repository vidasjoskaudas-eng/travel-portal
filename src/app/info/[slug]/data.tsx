// Informacija 3 kortelėms – galite redaguoti ir papildyti

import type { ReactNode } from "react";

export const infoPages: Record<
  string,
  { title: string; description: string; icon: string; extraContent: ReactNode }
> = {
  planuok: {
    title: "Planuok keliones",
    description:
      "Sukurk kelionę, nustatyk datas ir pakviesk draugus prisijungti. Visi planai saugomi vienoje vietoje.",
    icon: "🗓️",
    extraContent: (
      <div className="space-y-3">
        <p>
          Sukurti naują kelionę galite puslapyje <strong>Kelionės → Nauja kelionė</strong>.
          Įrašykite pavadinimą, tikslą (pvz. miestas, šalis) ir pasirinkite datas.
        </p>
        <p>
          Po sukūrimo galite pakviesti dalyvius el. paštu – jie gaus kvietimą ir
          galės prisijungti prie kelionės plano.
        </p>
      </div>
    ),
  },
  bendradarbiaukite: {
    title: "Bendradarbiaukite",
    description:
      "Visi dalyviai gali siūlyti veiklas ir balsuoti už mėgstamiausias. Planuokite kartu.",
    icon: "👥",
    extraContent: (
      <div className="space-y-3">
        <p>
          Kelionės organizatorius gali <strong>pakviesti dalyvius</strong> –
          pakanka žinoti jų el. paštą (vartotojas turi būti užsiregistravęs
          portale).
        </p>
        <p>
          Dalyviai gali <strong>pridėti veiklas</strong> į kelionės planą:
          vietas, laiką, kainas. Visi mato tą patį planą ir gali jį papildyti.
        </p>
      </div>
    ),
  },
  detales: {
    title: "Tvarkykite detales",
    description:
      "Vietos, laikas, išlaidos – viskas vienoje vietoje. Nieko nepraleiskite.",
    icon: "📍",
    extraContent: (
      <div className="space-y-3">
        <p>
          Kiekvienai <strong>veiklai</strong> galite nurodyti: pavadinimą,
          aprašymą, vietą, datą, laiką ir kainą. Taip lengva matyti dienotvarkę
          ir bendras išlaidas.
        </p>
        <p>
          Kelionės puslapyje rodoma <strong>bendra kaina</strong> pagal
          įvestas veiklas – patogu planuoti biudžetą.
        </p>
      </div>
    ),
  },
};
