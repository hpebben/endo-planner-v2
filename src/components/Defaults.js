// Empty case defaults. Device preferences must be applied explicitly by the user
// and should never appear in a case summary merely because a new case was opened.
export default {
  stage: null,
  clinical: {
    wound: null,
    ischemia: null,
    infection: null,
  },
  patencySegments: {},
  targetArterialPath: [],
  targetArterialPathKey: '',
  targetArterialPathSide: '',
  targetArterialPathNote: '',
  appliedPreferenceProfile: null,
  access: {
    needle: {},
    sheath: {},
    catheter: {},
  },
  navigation: {
    wire: {},
  },
  vesselPrep: {
    balloon: {},
  },
  closure: {},
};
