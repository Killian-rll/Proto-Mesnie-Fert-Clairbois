/* ==========================================================================
   CONFIGURATION DES FÉODALES DE CLAIRBOIS — fichier à modifier par l'association
   --------------------------------------------------------------------------
   Les dates sont calculées automatiquement : le 2e week-end de chaque mois
   listé dans « mois ». Le site passe tout seul à la saison suivante une fois
   la dernière fête terminée.
   ========================================================================== */

window.MESNIE = {
  // Mois des Féodales (4 = avril … 8 = août)
  mois: [4, 5, 6, 7, 8],

  horaires: {
    samedi: { ouverture: "14:00", fermeture: "19:00" },
    dimanche: { ouverture: "10:00", fermeture: "18:00" }
  },

  tarif: { prix: "8 €", gratuit: "Gratuit pour les moins de 12 ans" },

  lieu: {
    nom: "Domaine de la Ferté-Clairbois",
    adresse: "53270 Sainte-Suzanne-et-Chammes"
  },

  // Décalage exceptionnel : "AAAA-MM": "AAAA-MM-JJ" (date du samedi)
  exceptions: {},

  // Fêtes annulées : ["AAAA-MM"]
  annulations: [],

  // Billetterie générale (utilisée si une date n'a pas sa propre billetterie)
  billetterie: "https://www.helloasso.com/associations/la-mesnie-de-la-ferte-clairbois",

  // Billetterie de chaque date : "AAAA-MM": "lien HelloAsso de ce week-end"
  billets: {
    // "2027-04": "https://www.helloasso.com/associations/la-mesnie-de-la-ferte-clairbois/evenements/..."
  }
};
