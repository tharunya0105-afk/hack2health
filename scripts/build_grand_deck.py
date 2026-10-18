import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

OUTPUT_PPTX = 'Hack2Heal_2.0_NeuroBridge_Grand_Submission.pptx'
OUTPUT_PDF = 'Hack2Heal_2.0_NeuroBridge_Grand_Submission.pdf'

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

# Semantic Colors
C_DARK = RGBColor(15, 23, 42)          # Slate 900
C_TEXT_MAIN = RGBColor(30, 41, 59)     # Slate 800
C_TEXT_MUTED = RGBColor(100, 116, 139) # Slate 500
C_WHITE = RGBColor(255, 255, 255)

# Accent Themes
C_RED_BG = RGBColor(254, 242, 242)      # Rose 50
C_RED_BORDER = RGBColor(254, 205, 211)  # Rose 200
C_RED_TITLE = RGBColor(190, 18, 60)     # Rose 700
C_RED_ICON = RGBColor(225, 29, 72)      # Rose 600

C_GREEN_BG = RGBColor(240, 253, 244)    # Emerald 50
C_GREEN_BORDER = RGBColor(187, 247, 208)# Emerald 200
C_GREEN_TITLE = RGBColor(4, 120, 87)    # Emerald 700
C_GREEN_ICON = RGBColor(16, 185, 129)   # Emerald 500

C_PURPLE_BG = RGBColor(250, 245, 255)   # Purple 50
C_PURPLE_BORDER = RGBColor(233, 213, 255)# Purple 200
C_PURPLE_TITLE = RGBColor(109, 40, 217) # Purple 700
C_PURPLE_ICON = RGBColor(147, 51, 234)  # Purple 600

C_BLUE_BG = RGBColor(239, 246, 255)     # Blue 50
C_BLUE_BORDER = RGBColor(191, 219, 254) # Blue 200
C_BLUE_TITLE = RGBColor(29, 78, 216)    # Blue 700
C_BLUE_ICON = RGBColor(37, 99, 235)     # Blue 600

C_AMBER_BG = RGBColor(254, 252, 232)    # Amber 50
C_AMBER_BORDER = RGBColor(254, 240, 138)# Amber 200
C_AMBER_TITLE = RGBColor(180, 83, 9)    # Amber 700
C_AMBER_ICON = RGBColor(217, 119, 6)    # Amber 600

C_CARD_BG = RGBColor(255, 255, 255)
C_CARD_BORDER = RGBColor(226, 232, 240) # Slate 200
C_ACCENT_LINE = RGBColor(16, 185, 129)  # Emerald 500

def add_slide_header(slide, title_text, team_text="Innovengers / Team NeuroBridge"):
    # Left Oval Team Tag
    oval = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.4), Inches(0.25), Inches(1.8), Inches(0.55))
    oval.fill.solid()
    oval.fill.fore_color.rgb = C_WHITE
    oval.line.color.rgb = RGBColor(71, 85, 105)
    oval.line.width = Pt(1.5)
    tf = oval.text_frame
    p = tf.paragraphs[0]
    p.text = "Team NeuroBridge"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = C_TEXT_MAIN
    p.alignment = PP_ALIGN.CENTER

    # Title
    t_box = slide.shapes.add_textbox(Inches(2.4), Inches(0.22), Inches(8.8), Inches(0.65))
    tf = t_box.text_frame
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = C_DARK
    p.alignment = PP_ALIGN.CENTER

    # Right Hackathon Badge
    h_badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(11.4), Inches(0.2), Inches(1.5), Inches(0.65))
    h_badge.fill.solid()
    h_badge.fill.fore_color.rgb = C_WHITE
    h_badge.line.color.rgb = C_GREEN_ICON
    h_badge.line.width = Pt(1.5)
    tf = h_badge.text_frame
    p = tf.paragraphs[0]
    p.text = "HACK2HEAL"
    p.font.size = Pt(9)
    p.font.bold = True
    p.font.color.rgb = C_GREEN_TITLE
    p.alignment = PP_ALIGN.CENTER
    p2 = tf.add_paragraph()
    p2.text = "2.0 • 2026"
    p2.font.size = Pt(8.5)
    p2.font.color.rgb = C_TEXT_MUTED
    p2.alignment = PP_ALIGN.CENTER

def add_slide_footer(slide, slide_num):
    foot_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(7.1), Inches(13.333), Inches(0.4))
    foot_bar.fill.solid()
    foot_bar.fill.fore_color.rgb = RGBColor(14, 116, 144) # Deep Cyan
    foot_bar.line.fill.background()

    tb = slide.shapes.add_textbox(Inches(0.5), Inches(7.12), Inches(12.333), Inches(0.35))
    tf = tb.text_frame
    p = tf.paragraphs[0]
    p.text = f"@H2H Idea submission- Template                                                                                                                                           {slide_num}"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

def draw_pill_card(slide, left, top, width, height, title, subtitle="", bg_color=C_CARD_BG, border_color=C_CARD_BORDER, title_color=C_DARK):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1.5)
    return card

# =========================================================================
# SLIDE 1: PROPOSED SOLUTION (Grand 3-Card Comparison + 8-Step Loop)
# =========================================================================
s1 = prs.slides.add_slide(prs.slide_layouts[6])
add_slide_header(s1, "PROPOSED SOLUTION: NEUROBRIDGE PLATFORM")

# Subtitle banner
sub_b = s1.shapes.add_textbox(Inches(0.4), Inches(0.85), Inches(12.5), Inches(0.4))
tf = sub_b.text_frame
p = tf.paragraphs[0]
p.text = "Bidirectional Double Empathy Translation & Wearer-Controlled Multimodal Healthcare Bridge"
p.font.size = Pt(13)
p.font.bold = True
p.font.color.rgb = C_GREEN_TITLE
p.alignment = PP_ALIGN.CENTER

# 3 Comparison Columns at Top
col_w = Inches(3.95)
col_h = Inches(3.4)
top_y = Inches(1.3)

# 1. TRADITIONAL AAC APPROACH (Red Card)
c_red = draw_pill_card(s1, Inches(0.4), top_y, col_w, col_h, C_RED_BG, C_RED_BORDER)
# Header badge
hb1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.55), top_y + Inches(0.12), Inches(3.65), Inches(0.42))
hb1.fill.solid()
hb1.fill.fore_color.rgb = C_RED_TITLE
hb1.line.fill.background()
tf = hb1.text_frame
p = tf.paragraphs[0]
p.text = "TRADITIONAL AAC APPROACH (Deficit & Masking)"
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = C_WHITE
p.alignment = PP_ALIGN.CENTER

tb_red = s1.shapes.add_textbox(Inches(0.5), top_y + Inches(0.58), Inches(3.75), Inches(2.7))
tf_r = tb_red.text_frame
tf_r.word_wrap = True

red_points = [
    "Unilateral Masking Focus: Trains autistic users to suppress natural traits and mimic neurotypical norms.",
    "Prohibitive Hardware Cost: Dedicated AAC devices (Dynavox) cost $4,000–$8,000 with long insurance delays.",
    "One-Way Voice Output: Static symbol grids speak out loud but offer zero subtext or intent clarification.",
    "Blind to Situational Mutism: Assumes motor ability to navigate menus during acute sensory shutdowns.",
    "Naive AI Abuse Gaslighting: Generic chatbots mistake hostile bullying ('nobody likes you') for friendly idioms."
]
for pt in red_points:
    p = tf_r.add_paragraph()
    p.text = f"❌  {pt}"
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_TEXT_MAIN

# 2. NEUROBRIDGE DUAL-ENGINE (Green Card)
c_grn = draw_pill_card(s1, Inches(4.65), top_y, col_w, col_h, C_GREEN_BG, C_GREEN_BORDER)
hb2 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.8), top_y + Inches(0.12), Inches(3.65), Inches(0.42))
hb2.fill.solid()
hb2.fill.fore_color.rgb = C_GREEN_TITLE
hb2.line.fill.background()
tf = hb2.text_frame
p = tf.paragraphs[0]
p.text = "NEUROBRIDGE DUAL-ENGINE (Double Empathy AI)"
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = C_WHITE
p.alignment = PP_ALIGN.CENTER

tb_grn = s1.shapes.add_textbox(Inches(4.75), top_y + Inches(0.58), Inches(3.75), Inches(2.7))
tf_g = tb_grn.text_frame
tf_g.word_wrap = True

grn_points = [
    "Reciprocal Subtext Translation: Translates idioms for autistic wearers and directness for neurotypical peers.",
    "Ubiquitous Zero-Cost Hardware: Runs in browser on existing laptops/phones (https://hack2health.vercel.app).",
    "4-in-1 Multimodal Timeline: Unifies Speech, Switch-Scanning, AAC Chips, and 3D MediaPipe Stim Gestures.",
    "Wearer-Sovereign Safety Net: On-demand GPS & Communication Passport dispatch without 24/7 surveillance.",
    "Anti-Gaslighting Hostility Shield: Detects malicious insults and protects against Rejection Dysphoria (RSD)."
]
for pt in grn_points:
    p = tf_g.add_paragraph()
    p.text = f"✔  {pt}"
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_TEXT_MAIN

# 3. THE HEALTHCARE PROBLEM WE SOLVE (Purple Card)
c_pur = draw_pill_card(s1, Inches(8.9), top_y, col_w, col_h, C_PURPLE_BG, C_PURPLE_BORDER)
hb3 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.05), top_y + Inches(0.12), Inches(3.65), Inches(0.42))
hb3.fill.solid()
hb3.fill.fore_color.rgb = C_PURPLE_TITLE
hb3.line.fill.background()
tf = hb3.text_frame
p = tf.paragraphs[0]
p.text = "THE PROBLEM WE SOLVE (The Social Cliff)"
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = C_WHITE
p.alignment = PP_ALIGN.CENTER

tb_pur = s1.shapes.add_textbox(Inches(9.0), top_y + Inches(0.58), Inches(3.75), Inches(2.7))
tf_p = tb_pur.text_frame
tf_p.word_wrap = True

pur_points = [
    "The 40% Segregation Cliff: Over 40% of autistic students spend school in segregated classes (NCES Data).",
    "Abrupt Aid Termination: Transition to college/work brings sudden loss of 1:1 paraprofessional aides.",
    "Situational Mutism In Crises: High sensory environments (cafeterias >75dB) cause vocal speech loss.",
    "Masking & Autistic Burnout: Forcing neurotypical imitation causes chronic fatigue, anxiety, and depression.",
    "Dignified Healthcare Mission: Empowering autonomous social agency and mutual cross-neurotype respect."
]
for pt in pur_points:
    p = tf_p.add_paragraph()
    p.text = f"🎯  {pt}"
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_TEXT_MAIN

# BOTTOM SECTION: 8-STEP INTELLIGENCE LOOP
loop_y = Inches(4.8)
loop_title = s1.shapes.add_textbox(Inches(0.4), loop_y, Inches(12.5), Inches(0.35))
tf = loop_title.text_frame
p = tf.paragraphs[0]
p.text = "OUR MULTIMODAL ASSISTIVE INTELLIGENCE LOOP"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = C_DARK
p.alignment = PP_ALIGN.CENTER

steps = [
    ("1", "INGEST", "Audio, Switch,\nAAC, 3D Stims"),
    ("2", "RADAR", "Acoustic dB &\nNoise Monitor"),
    ("3", "KINEMATICS", "800ms Buffer &\nFingertip Curl"),
    ("4", "DOUBLE EMPATHY", "Milton (2012)\nPragmatic Rules"),
    ("5", "DUAL-ENGINE", "Gemini 2.5 Flash\n+ Offline Regex"),
    ("6", "CLARIFY", "Subtext Cards\n& Intent Shield"),
    ("7", "SAFETY NET", "GPS Beacon &\nMedical Passport"),
    ("8", "DELIVER", "SSE Dashboard &\nPeer Circles")
]

step_w = Inches(1.3)
step_gap = Inches(0.24)
start_x = Inches(0.5)

for i, (num, stitle, sdesc) in enumerate(steps):
    sx = start_x + i * (step_w + step_gap)
    # Circle badge
    circle = s1.shapes.add_shape(MSO_SHAPE.OVAL, sx + Inches(0.45), loop_y + Inches(0.4), Inches(0.4), Inches(0.4))
    circle.fill.solid()
    circle.fill.fore_color.rgb = C_BLUE_ICON if i < 4 else C_PURPLE_ICON
    circle.line.fill.background()
    tf = circle.text_frame
    p = tf.paragraphs[0]
    p.text = num
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.alignment = PP_ALIGN.CENTER

    # Arrow connector between circles
    if i < 7:
        arrow = s1.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, sx + Inches(1.05), loop_y + Inches(0.52), Inches(0.35), Inches(0.16))
        arrow.fill.solid()
        arrow.fill.fore_color.rgb = RGBColor(148, 163, 184)
        arrow.line.fill.background()

    # Label box
    l_box = s1.shapes.add_textbox(sx - Inches(0.1), loop_y + Inches(0.85), step_w + Inches(0.2), Inches(0.8))
    tf = l_box.text_frame
    p = tf.paragraphs[0]
    p.text = stitle
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = C_DARK
    p.alignment = PP_ALIGN.CENTER
    p2 = tf.add_paragraph()
    p2.text = sdesc
    p2.font.size = Pt(8)
    p2.font.color.rgb = C_TEXT_MUTED
    p2.alignment = PP_ALIGN.CENTER

# Bottom bar for adaptive engine
adapt_bar = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.0), Inches(6.45), Inches(7.333), Inches(0.45))
adapt_bar.fill.solid()
adapt_bar.fill.fore_color.rgb = RGBColor(30, 27, 75) # Deep Violet
adapt_bar.line.fill.background()
tf = adapt_bar.text_frame
p = tf.paragraphs[0]
p.text = "⚡ ADAPTIVE DUAL-ENGINE: Continuously personalizes vocabulary & suppresses downvoted idioms in real time"
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = C_WHITE
p.alignment = PP_ALIGN.CENTER

add_slide_footer(s1, 1)

# =========================================================================
# SLIDE 2: TECHNICAL APPROACH (5-Column End-to-End Pipeline)
# =========================================================================
s2 = prs.slides.add_slide(prs.slide_layouts[6])
add_slide_header(s2, "TECHNICAL APPROACH & SYSTEM ARCHITECTURE")

# 5 Columns Across Slide
c_w = Inches(2.2)
c_gap = Inches(0.22)
c_top = Inches(1.1)
c_h = Inches(5.7)

stages = [
    {
        'hdr': 'DATA SOURCES',
        'color': C_BLUE_TITLE,
        'bg': C_BLUE_BG,
        'cards': [
            ('Spoken Audio', 'Web Speech API streaming raw acoustic input in browser'),
            ('Switch Scanning', 'Single-switch scanning keyboard for fine motor differences'),
            ('Typed AAC Chips', 'Structured quick-response non-verbal symbol cards'),
            ('3D Hand Tracking', 'MediaPipe 21-joint 3D kinematic landmark coordinates'),
            ('Sensory Decibels', 'Web Audio API real-time acoustic sound pressure (SPL)')
        ]
    },
    {
        'hdr': 'DATA PROCESSING',
        'color': RGBColor(13, 148, 136), # Teal
        'bg': RGBColor(240, 253, 250),
        'cards': [
            ('Input Ingestion', 'Unified stream normalization via centralized /api/analyze'),
            ('Kinematic Buffer', '12-frame rolling buffer (~800ms) tracking velocity & reversals'),
            ('Curl Verification', 'Fingertip-wrist angle check eliminates resting hand false alarms'),
            ('Data Cleansing', 'Disfluency & filler word extraction preserves core sentiment'),
            ('Session State', 'Local cache persists calibrated gestures & emergency profile')
        ]
    },
    {
        'hdr': 'PREDICTION ENGINE',
        'color': C_PURPLE_TITLE,
        'bg': C_PURPLE_BG,
        'cards': [
            ('Google Gemini 2.5', 'Primary LLM: deep pragmatic subtext resolution & reasoning'),
            ('Offline Heuristics', 'Zero-downtime regex engine for transit tunnels / basements'),
            ('Double Empathy', 'Bidirectional classification: idiom, sarcasm, bluntness, hostile'),
            ('Anti-Gaslighting', 'Shield: Detects malice, refuses to excuse bullying as idioms'),
            ('Personalization', 'Real-time feedback loop suppresses disliked clarification types')
        ]
    },
    {
        'hdr': 'SOVEREIGN OUTPUTS',
        'color': C_AMBER_TITLE,
        'bg': C_AMBER_BG,
        'cards': [
            ('Clarification Cards', 'Real-time contextual meaning displayed in chat timeline'),
            ('Sovereign Safety Net', 'GPS emergency beacon & situational mutism alert dispatch'),
            ('Communication ID', 'Digital medical card for first responders & educators'),
            ('Tactful Exit Card', 'One-tap polite sensory recharge boundary notifications'),
            ('Peer Social Hub', 'Parallel-play virtual co-working with zero small-talk')
        ]
    },
    {
        'hdr': 'TECHNOLOGIES USED',
        'color': C_GREEN_TITLE,
        'bg': C_GREEN_BG,
        'cards': [
            ('Frontend Core', 'React 19, Vite 8.3, Glassmorphism CSS Design'),
            ('Backend Engine', 'Node.js, Express.js REST API, Server-Sent Events'),
            ('AI & Vision Core', 'Google Gemini 2.5 Flash, MediaPipe Vision Wasm'),
            ('Accessibility APIs', 'Web Speech API, DeviceMotion (G-Force), Geolocation'),
            ('Deployment', 'Vercel Edge Serverless, GitHub CI/CD, Automated Tests')
        ]
    }
]

for col_idx, st in enumerate(stages):
    cx = Inches(0.4) + col_idx * (c_w + c_gap)
    
    # Outer column container
    col_card = draw_pill_card(s2, cx, c_top, c_w, c_h, st['bg'], RGBColor(226, 232, 240))
    
    # Header Banner
    h_pill = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.1), c_top + Inches(0.12), c_w - Inches(0.2), Inches(0.38))
    h_pill.fill.solid()
    h_pill.fill.fore_color.rgb = st['color']
    h_pill.line.fill.background()
    tf = h_pill.text_frame
    p = tf.paragraphs[0]
    p.text = st['hdr']
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.alignment = PP_ALIGN.CENTER

    # Cards in column
    card_y = c_top + Inches(0.58)
    card_item_h = Inches(0.96)
    for c_title, c_desc in st['cards']:
        icard = draw_pill_card(s2, cx + Inches(0.1), card_y, c_w - Inches(0.2), card_item_h, C_WHITE, RGBColor(203, 213, 225))
        tb = s2.shapes.add_textbox(cx + Inches(0.15), card_y + Inches(0.04), c_w - Inches(0.3), card_item_h - Inches(0.08))
        tf_c = tb.text_frame
        tf_c.word_wrap = True
        p = tf_c.paragraphs[0]
        p.text = c_title
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = C_DARK
        p2 = tf_c.add_paragraph()
        p2.text = c_desc
        p2.font.size = Pt(8)
        p2.font.color.rgb = C_TEXT_MUTED
        card_y += card_item_h + Inches(0.06)

    # Connector Arrow to next column
    if col_idx < 3:
        arr = s2.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, cx + c_w + Inches(0.04), c_top + Inches(2.7), Inches(0.14), Inches(0.24))
        arr.fill.solid()
        arr.fill.fore_color.rgb = C_BLUE_ICON
        arr.line.fill.background()

add_slide_footer(s2, 2)

# =========================================================================
# SLIDE 3: FEASIBILITY AND VIABILITY (3-Row Layout with Icons & Badges)
# =========================================================================
s3 = prs.slides.add_slide(prs.slide_layouts[6])
add_slide_header(s3, "FEASIBILITY AND VIABILITY ANALYSIS")

row_w = Inches(12.5)
r1_top = Inches(1.1)
r_h = Inches(1.8)

# 1. FEASIBILITY (Green Row)
f_row = draw_pill_card(s3, Inches(0.4), r1_top, row_w, r_h, C_GREEN_BG, C_GREEN_BORDER)
# Left Badge
fb = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.55), r1_top + Inches(0.12), Inches(1.8), Inches(0.35))
fb.fill.solid()
fb.fill.fore_color.rgb = C_GREEN_TITLE
fb.line.fill.background()
tf = fb.text_frame
p = tf.paragraphs[0]
p.text = "✔ FEASIBILITY"
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = C_WHITE
p.alignment = PP_ALIGN.CENTER

f_cols = [
    ("Zero Hardware Barrier", "Runs on ubiquitous web browsers (Chrome, Safari, Edge) on existing student phones and laptops. Eliminates $7,000 proprietary hardware barriers."),
    ("Production Proven Today", "Live full-stack deployment active on Vercel at https://hack2health.vercel.app. Instant edge execution across worldwide edge nodes."),
    ("Cost & Scale Efficiency", "Serverless micro-architecture executes Gemini 2.5 Flash only on demand, costing <$0.01 per conversation with zero idle infrastructure cost.")
]
for idx, (ctitle, cdesc) in enumerate(f_cols):
    bx = Inches(0.6) + idx * Inches(4.1)
    b_card = draw_pill_card(s3, bx, r1_top + Inches(0.55), Inches(3.9), Inches(1.15), C_WHITE, RGBColor(187, 247, 208))
    tb = s3.shapes.add_textbox(bx + Inches(0.15), r1_top + Inches(0.6), Inches(3.6), Inches(1.05))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = f"• {ctitle}"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = C_GREEN_TITLE
    p2 = tf.add_paragraph()
    p2.text = cdesc
    p2.font.size = Pt(8.5)
    p2.font.color.rgb = C_TEXT_MAIN

# 2. KEY CHALLENGES (Red Row)
r2_top = Inches(3.05)
c_row = draw_pill_card(s3, Inches(0.4), r2_top, row_w, r_h, C_RED_BG, C_RED_BORDER)
cb = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.55), r2_top + Inches(0.12), Inches(1.8), Inches(0.35))
cb.fill.solid()
cb.fill.fore_color.rgb = C_RED_TITLE
cb.line.fill.background()
tf = cb.text_frame
p = tf.paragraphs[0]
p.text = "⚠ KEY CHALLENGES"
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = C_WHITE
p.alignment = PP_ALIGN.CENTER

c_cols = [
    ("High Acoustic Noise", "Cafeteria background chatter (75–85 dB) degrades standard browser microphone speech recognition accuracy during social transitions."),
    ("Mobile OS Sensor Throttling", "Mobile Android and iOS operating systems suspend background browser tab sensors and camera feeds when the screen is locked."),
    ("AAC Typo & Lexical Noise", "Autistic disfluency, dyspraxia, or rapid typing generates phonetic spelling errors ('neeeed a brek') that bypass simple regex matching.")
]
for idx, (ctitle, cdesc) in enumerate(c_cols):
    bx = Inches(0.6) + idx * Inches(4.1)
    b_card = draw_pill_card(s3, bx, r2_top + Inches(0.55), Inches(3.9), Inches(1.15), C_WHITE, RGBColor(254, 205, 211))
    tb = s3.shapes.add_textbox(bx + Inches(0.15), r2_top + Inches(0.6), Inches(3.6), Inches(1.05))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = f"• {ctitle}"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = C_RED_TITLE
    p2 = tf.add_paragraph()
    p2.text = cdesc
    p2.font.size = Pt(8.5)
    p2.font.color.rgb = C_TEXT_MAIN

# 3. OUR STRATEGY (Blue Row)
r3_top = Inches(5.0)
s_row = draw_pill_card(s3, Inches(0.4), r3_top, row_w, r_h, C_BLUE_BG, C_BLUE_BORDER)
sb = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.55), r3_top + Inches(0.12), Inches(1.8), Inches(0.35))
sb.fill.solid()
sb.fill.fore_color.rgb = C_BLUE_TITLE
sb.line.fill.background()
tf = sb.text_frame
p = tf.paragraphs[0]
p.text = "🎯 OUR STRATEGY"
p.font.size = Pt(10)
p.font.bold = True
p.font.color.rgb = C_WHITE
p.alignment = PP_ALIGN.CENTER

s_cols = [
    ("Multimodal Input Fallback", "When noise peaks on the Sensory Radar, the wearer seamlessly shifts to single-switch scanning or one-tap quick-response AAC chips with zero downtime."),
    ("Native Daemon Packaging", "Phase 3 roadmap packages the web app into a Capacitor/React Native daemon with an Android Foreground Service for locked-screen fall monitoring."),
    ("LLM Intent Reconstruction", "Gemini 2.5 Flash semantically extracts the core emotional/functional intent from disjointed spelling without judging grammar or penalizing the user.")
]
for idx, (ctitle, cdesc) in enumerate(s_cols):
    bx = Inches(0.6) + idx * Inches(4.1)
    b_card = draw_pill_card(s3, bx, r3_top + Inches(0.55), Inches(3.9), Inches(1.15), C_WHITE, RGBColor(191, 219, 254))
    tb = s3.shapes.add_textbox(bx + Inches(0.15), r3_top + Inches(0.6), Inches(3.6), Inches(1.05))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = f"• {ctitle}"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = C_BLUE_TITLE
    p2 = tf.add_paragraph()
    p2.text = cdesc
    p2.font.size = Pt(8.5)
    p2.font.color.rgb = C_TEXT_MAIN

add_slide_footer(s3, 3)

# =========================================================================
# SLIDE 4: IMPACT AND BENEFITS (2 Major Sections with 3 Columns Each)
# =========================================================================
s4 = prs.slides.add_slide(prs.slide_layouts[6])
add_slide_header(s4, "IMPACT AND BENEFITS ASSESSMENT")

sec_w = Inches(12.5)
s1_top = Inches(1.1)
s1_h = Inches(2.8)

# Section 1: POTENTIAL IMPACT ON TARGET AUDIENCE (Blue Theme)
s1_card = draw_pill_card(s4, Inches(0.4), s1_top, sec_w, s1_h, C_BLUE_BG, C_BLUE_BORDER)
sb1 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.55), s1_top + Inches(0.12), Inches(4.2), Inches(0.38))
sb1.fill.solid()
sb1.fill.fore_color.rgb = C_BLUE_TITLE
sb1.line.fill.background()
tf = sb1.text_frame
p = tf.paragraphs[0]
p.text = "👥 POTENTIAL IMPACT ON TARGET AUDIENCE"
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = C_WHITE
p.alignment = PP_ALIGN.CENTER

audience_cols = [
    ("AUTISTIC YOUNG ADULTS (14-24)", "Overcoming The Social Cliff", [
        "Eliminates reliance on 1:1 human aides upon graduation.",
        "Prevents situational mutism panic via quick AAC & stims.",
        "Tactful Exit Cards lower autistic masking burnout.",
        "Empowers genuine self-advocacy in social spaces."
    ]),
    ("PARENTS & GUARDIANS", "Sovereign Peace of Mind", [
        "Real-time GPS safe perimeter tracking on Guardian View.",
        "Alerts sent automatically during acute sensory distress.",
        "Zero invasive 24/7 spying: telemetry sent by wearer consent.",
        "Direct emergency calling with real-time location details."
    ]),
    ("EDUCATORS & PEERS", "Mutual Understanding (Double Empathy)", [
        "Educates peers: bluntness is clear honesty, not malice.",
        "Explains stimming as joyful energy regulation, not crisis.",
        "Equips college counselors with Communication Passports.",
        "Promotes inclusive parallel-play study environments."
    ])
]

for idx, (title, sub, pts) in enumerate(audience_cols):
    bx = Inches(0.6) + idx * Inches(4.1)
    acard = draw_pill_card(s4, bx, s1_top + Inches(0.58), Inches(3.9), Inches(2.1), C_WHITE, RGBColor(191, 219, 254))
    tb = s4.shapes.add_textbox(bx + Inches(0.15), s1_top + Inches(0.62), Inches(3.6), Inches(2.0))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = C_BLUE_TITLE
    p_sub = tf.add_paragraph()
    p_sub.text = sub
    p_sub.font.size = Pt(8.5)
    p_sub.font.color.rgb = C_TEXT_MUTED
    for pt in pts:
        p_pt = tf.add_paragraph()
        p_pt.text = f"• {pt}"
        p_pt.font.size = Pt(8)
        p_pt.font.color.rgb = C_TEXT_MAIN

# Section 2: BENEFITS OF THE SOLUTION (Green Theme)
s2_top = Inches(4.05)
s2_h = Inches(2.8)
s2_card = draw_pill_card(s4, Inches(0.4), s2_top, sec_w, s2_h, C_GREEN_BG, C_GREEN_BORDER)
sb2 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.55), s2_top + Inches(0.12), Inches(3.6), Inches(0.38))
sb2.fill.solid()
sb2.fill.fore_color.rgb = C_GREEN_TITLE
sb2.line.fill.background()
tf = sb2.text_frame
p = tf.paragraphs[0]
p.text = "✔ BENEFITS OF THE SOLUTION"
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = C_WHITE
p.alignment = PP_ALIGN.CENTER

benefit_cols = [
    ("SOCIAL BENEFITS", "Inclusion Without Forced Masking", [
        "Fosters authentic neurodivergent friendships.",
        "Social Wingman matches intense shared passions.",
        "Replaces anxiety with structured, predictable interactions.",
        "Destigmatizes stimming and AAC communication in public."
    ]),
    ("ECONOMIC BENEFITS", "Democratizing $7,000 Medical Tech", [
        "Saves families $4,000–$8,000 per user vs proprietary hardware.",
        "Reduces institutional special education aide expenses.",
        "Zero subscription barrier: free open-access web prototype.",
        "Runs on existing hardware without insurance delays."
    ]),
    ("HEALTHCARE & CLINICAL BENEFITS", "Preventative Mental Health", [
        "Drastically lowers autistic burnout and clinical depression.",
        "Reduces emergency room visits from panic & disorientations.",
        "First responders receive immediate sensory crisis protocols.",
        "18 automated self-tests guarantee verified API robustness."
    ])
]

for idx, (title, sub, pts) in enumerate(benefit_cols):
    bx = Inches(0.6) + idx * Inches(4.1)
    bcard = draw_pill_card(s4, bx, s2_top + Inches(0.58), Inches(3.9), Inches(2.1), C_WHITE, RGBColor(187, 247, 208))
    tb = s4.shapes.add_textbox(bx + Inches(0.15), s2_top + Inches(0.62), Inches(3.6), Inches(2.0))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = C_GREEN_TITLE
    p_sub = tf.add_paragraph()
    p_sub.text = sub
    p_sub.font.size = Pt(8.5)
    p_sub.font.color.rgb = C_TEXT_MUTED
    for pt in pts:
        p_pt = tf.add_paragraph()
        p_pt.text = f"• {pt}"
        p_pt.font.size = Pt(8)
        p_pt.font.color.rgb = C_TEXT_MAIN

add_slide_footer(s4, 4)

# =========================================================================
# SLIDE 5: RESEARCH AND REFERENCES (Formatted High-Impact Resource Hub)
# =========================================================================
s5 = prs.slides.add_slide(prs.slide_layouts[6])
add_slide_header(s5, "RESEARCH AND REFERENCES")

col_w5 = Inches(6.1)
top_y5 = Inches(1.1)
h5 = Inches(5.7)

# Left Column: Peer-Reviewed Scientific & Clinical Citations
c_sci = draw_pill_card(s5, Inches(0.4), top_y5, col_w5, h5, C_PURPLE_BG, C_PURPLE_BORDER)
sb_sci = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.55), top_y5 + Inches(0.12), col_w5 - Inches(0.3), Inches(0.42))
sb_sci.fill.solid()
sb_sci.fill.fore_color.rgb = C_PURPLE_TITLE
sb_sci.line.fill.background()
tf = sb_sci.text_frame
p = tf.paragraphs[0]
p.text = "📚 PEER-REVIEWED CLINICAL & SCIENTIFIC LITERATURE"
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = C_WHITE
p.alignment = PP_ALIGN.CENTER

tb_sci = s5.shapes.add_textbox(Inches(0.6), top_y5 + Inches(0.65), col_w5 - Inches(0.4), h5 - Inches(0.8))
tf_s = tb_sci.text_frame
tf_s.word_wrap = True

refs = [
    ("1. The Double Empathy Problem (Milton, 2012)", 
     "Milton, D. E. (2012). 'On the ontological status of autism: the 'double empathy problem'.' Disability & Society, 27(6), 883-887.",
     "https://doi.org/10.1080/09687599.2012.710008",
     "Theoretical foundation: proves communication mismatch is reciprocal, not an autistic deficit."),
     
    ("2. Educational Segregation & The Social Cliff (NCES, 2024)",
     "U.S. Dept. of Education, National Center for Education Statistics. Digest of Education Statistics, Table 204.60 & IDEA Section 618.",
     "https://nces.ed.gov/programs/digest/d23/tables/dt23_204.60.asp",
     "Sourced data: Over 40% of autistic students are segregated in K-12 schooling, facing the Social Cliff upon transition."),
     
    ("3. Defining Autistic Burnout & Camouflaging (Raymaker et al., 2020)",
     "Raymaker, D. M., et al. (2020). 'Having All of Your Internal Resources Exhausted: Defining Autistic Burnout.' Autism in Adulthood, 2(2), 132-143.",
     "https://doi.org/10.1089/aut.2019.0079",
     "Clinical basis for Tactful Exit Cards: continuous masking leads to severe cognitive and functional exhaustion."),
     
    ("4. Rejection Sensitive Dysphoria & Neurodivergence",
     "Bedrossian, L. (2021). 'Understand and address rejection sensitive dysphoria.' Mental Health Practice, 24(6).",
     "https://doi.org/10.7748/mhp.2021.e1564",
     "Guides our Anti-Gaslighting Hostility Shield: protects wearers from misinterpreting abusive insults as benign idioms.")
]

for rtitle, rcit, rlink, rimp in refs:
    p = tf_s.add_paragraph()
    p.text = rtitle
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = C_PURPLE_TITLE
    p2 = tf_s.add_paragraph()
    p2.text = rcit
    p2.font.size = Pt(8)
    p2.font.color.rgb = C_TEXT_MAIN
    p3 = tf_s.add_paragraph()
    p3.text = f"Link: {rlink}"
    p3.font.size = Pt(7.5)
    p3.font.color.rgb = C_BLUE_TITLE
    p4 = tf_s.add_paragraph()
    p4.text = f"Impact on Solution: {rimp}\n"
    p4.font.size = Pt(8)
    p4.font.color.rgb = C_TEXT_MUTED

# Right Column: Technical Links, Verified Codebase & Prototype
c_tech = draw_pill_card(s5, Inches(6.8), top_y5, col_w5, h5, C_BLUE_BG, C_BLUE_BORDER)
sb_tech = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.95), top_y5 + Inches(0.12), col_w5 - Inches(0.3), Inches(0.42))
sb_tech.fill.solid()
sb_tech.fill.fore_color.rgb = C_BLUE_TITLE
sb_tech.line.fill.background()
tf = sb_tech.text_frame
p = tf.paragraphs[0]
p.text = "🌐 LIVE PLATFORM, OPEN-SOURCE CODE & SYSTEM ASSETS"
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = C_WHITE
p.alignment = PP_ALIGN.CENTER

tb_tech = s5.shapes.add_textbox(Inches(7.0), top_y5 + Inches(0.65), col_w5 - Inches(0.4), h5 - Inches(0.8))
tf_t = tb_tech.text_frame
tf_t.word_wrap = True

tech_links = [
    ("Live Deployed Application", "https://hack2health.vercel.app", "Active Vercel production deployment with Google Gemini 2.5 Flash LLM integration."),
    ("Mobile Guardian Safety Companion", "https://hack2health.vercel.app/?view=guardian", "Live SSE real-time telemetry dashboard streaming GPS coordinates & decibel readings."),
    ("Official GitHub Repository", "https://github.com/tharunya0105-afk/hack2health", "Full open-source codebase with React 19 frontend, Express backend & gesture modules."),
    ("Automated End-to-End Test Suite", "backend/test-suite.js", "18 automated tests verifying multimodal ingestion, scanning keyboards & adversarial speech."),
    ("Complete Video Demonstration", "gallery/neurobridge_demo_video.mp4", "1.63-minute 30FPS MP4 video walkthrough covering all 15 system capabilities."),
    ("MediaPipe HandLandmarker API", "https://developers.google.com/mediapipe/solutions/vision/hand_landmarker", "Float16 WebAssembly hand tracking tracking 21 3D landmarks in-browser.")
]

for ltitle, lurl, ldesc in tech_links:
    p = tf_t.add_paragraph()
    p.text = f"• {ltitle}"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = C_DARK
    p2 = tf_t.add_paragraph()
    p2.text = lurl
    p2.font.size = Pt(9)
    p2.font.bold = True
    p2.font.color.rgb = C_BLUE_TITLE
    p3 = tf_t.add_paragraph()
    p3.text = f"{ldesc}\n"
    p3.font.size = Pt(8)
    p3.font.color.rgb = C_TEXT_MUTED

add_slide_footer(s5, 5)

# Save presentation
prs.save(OUTPUT_PPTX)
print(f'Successfully built grand deck: {OUTPUT_PPTX}')

# Convert to PDF via PowerPoint COM
try:
    import win32com.client
    ppt = win32com.client.Dispatch('PowerPoint.Application')
    deck_path = os.path.abspath(OUTPUT_PPTX)
    pdf_path = os.path.abspath(OUTPUT_PDF)
    pres = ppt.Presentations.Open(deck_path, True, False, False)
    pres.SaveAs(pdf_path, 32)
    pres.Close()
    ppt.Quit()
    print(f'Successfully exported grand PDF: {OUTPUT_PDF} ({os.path.getsize(OUTPUT_PDF)/(1024*1024):.2f} MB)')
except Exception as e:
    print('PDF export warning:', e)
