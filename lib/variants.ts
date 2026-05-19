export interface VariantOption {
  id: string
  label: string
  prompt: string
}

export interface VariantAxe {
  id: string
  label: string
  options: VariantOption[]
}

export const AXE1_PROFILE: VariantAxe = {
  id: 'profile',
  label: 'Profile',
  options: [
    { id: 'homme45', label: 'Man 45–55', prompt: 'middle-aged man (45-55 years old)' },
    { id: 'femme35', label: 'Woman 35–45', prompt: 'middle-aged woman (35-45 years old)' },
    { id: 'jeune25', label: 'Young adult 25–35', prompt: 'young adult man (25-35 years old)' },
    { id: 'couple',  label: 'Couple',           prompt: 'smiling couple, a man and a woman (30-45 years old), both' },
  ],
}

export const AXE2_EMOTION: VariantAxe = {
  id: 'emotion',
  label: 'Emotion',
  options: [
    { id: 'sourire', label: 'Smiling at phone',   prompt: 'holding a smartphone and looking at it with joy, big warm smile' },
    { id: 'regard',  label: 'Looking at camera',  prompt: 'looking directly at camera with a warm confident smile, holding smartphone by side' },
    { id: 'relief',  label: 'Relief & happiness', prompt: 'expression of deep relief and happiness, eyes slightly closed, one hand on chest, holding phone' },
    { id: 'action',  label: 'Sending money',       prompt: 'actively pressing the send button on a smartphone screen, focused and proud expression' },
  ],
}

export const AXE3_ENV: VariantAxe = {
  id: 'environment',
  label: 'Environment',
  options: [
    { id: 'rue',       label: 'City street',      prompt: 'standing on a {city}, blurred bokeh street background' },
    { id: 'interieur', label: 'Home interior',     prompt: 'at home in a cozy European kitchen or living room, warm interior lighting, blurred background' },
    { id: 'travail',   label: 'Workplace',         prompt: 'at a professional worksite or warehouse, wearing casual work clothes, European urban context' },
    { id: 'transport', label: 'Public transport',  prompt: 'sitting in a European tram or subway car, blurred interior background, window light' },
  ],
}

export const AXE5_FRAMING: VariantAxe = {
  id: 'framing',
  label: 'Framing',
  options: [
    { id: 'centre', label: 'Centered portrait', prompt: 'centered portrait composition, face and upper chest filling most of the frame' },
    { id: 'gauche', label: 'Left offset',        prompt: 'subject positioned on the left third of the frame, empty space on the right' },
    { id: 'mi-corps', label: 'Half-body',        prompt: 'half-body shot from waist up, showing body language and context' },
    { id: 'bokeh',  label: 'Strong bokeh',       prompt: 'very shallow depth of field, extreme bokeh background blur, sharp focus on face only' },
  ],
}

export const ALL_AXES = [AXE1_PROFILE, AXE2_EMOTION, AXE3_ENV, AXE5_FRAMING]

export interface VariantConfig {
  profile:     VariantOption
  emotion:     VariantOption
  environment: VariantOption
  framing:     VariantOption
  label:       string
  badge:       string
}

export function buildVariants(
  profile:     VariantOption,
  emotion:     VariantOption,
  environment: VariantOption,
  framing:     VariantOption,
): VariantConfig[] {
  const next = <T>(arr: T[], item: T) => arr[(arr.indexOf(item) + 1) % arr.length]

  return [
    { profile, emotion, environment, framing, label: 'Control',        badge: 'V1' },
    { profile: next(AXE1_PROFILE.options, profile), emotion, environment, framing, label: `Profile — ${next(AXE1_PROFILE.options, profile).label}`, badge: 'V2' },
    { profile, emotion: next(AXE2_EMOTION.options, emotion), environment, framing, label: `Emotion — ${next(AXE2_EMOTION.options, emotion).label}`, badge: 'V3' },
    { profile, emotion, environment: next(AXE3_ENV.options, environment), framing, label: `Environment — ${next(AXE3_ENV.options, environment).label}`, badge: 'V4' },
  ]
}
