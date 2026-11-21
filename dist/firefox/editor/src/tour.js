// Guided tour steps. Each step points at an element and may switch the workflow phase first.
export const TOUR = [
  { target: '#openBtn', phase: 'edit', t: 'tour.s1.t', b: 'tour.s1.b' },
  { target: '#viewport', phase: 'edit', t: 'tour.s2.t', b: 'tour.s2.b' },
  { target: '.stage-bar', phase: 'edit', t: 'tour.s3.t', b: 'tour.s3.b' },
  { target: '.tools', phase: 'edit', t: 'tour.s4.t', b: 'tour.s4.b' },
  { target: '#phaseEdit .options', phase: 'edit', t: 'tour.s5.t', b: 'tour.s5.b' },
  { target: '.history', phase: 'edit', t: 'tour.s6.t', b: 'tour.s6.b' },
  { target: '#phaseOutBtn', phase: 'edit', t: 'tour.s7.t', b: 'tour.s7.b' },
  { target: '#phaseOut .options', phase: 'out', t: 'tour.s8.t', b: 'tour.s8.b' },
  { target: '#settingsBtn', phase: 'out', t: 'tour.s9.t', b: 'tour.s9.b' },
];
