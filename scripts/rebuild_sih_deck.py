import os
from PIL import Image, ImageDraw, ImageFont
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

os.makedirs('sih_generated', exist_ok=True)

# System fonts
font_heavy = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 38)
font_title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 30)
font_sec = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 24)
font_card_title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 21)
font_body = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 17)
font_body_bold = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 17)
font_small = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 14)
font_badge = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 15)
font_step_num = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 20)

# Colors
C_WHITE = (255, 255, 255)
C_DARK = (15, 23, 42)
C_MUTED = (100, 116, 139)
C_SLATE_BORDER = (226, 232, 240)

# Slide 1 Banner: Title Image (2000x200)
def make_title_banner_s1():
    W, H = 2000, 200
    im = Image.new('RGBA', (W, H), (255, 255, 255, 0))
    draw = ImageDraw.Draw(im)
    
    t1 = "NeuroBridge AI"
    draw.text(((W - draw.textlength(t1, font=font_heavy)) // 2, 20), t1, font=font_heavy, fill=(15, 23, 42))
    
    t2 = "Wearer-Controlled Multimodal Communication Bridge & Sovereign Safety Net Platform"
    draw.text(((W - draw.textlength(t2, font=font_sec)) // 2, 95), t2, font=font_sec, fill=(15, 23, 42))
    
    fn = 'sih_generated/title_s1.png'
    im.save(fn)
    return fn

# Slide 1 Main Graphic (2400x1200)
def make_main_s1():
    W, H = 2400, 1200
    im = Image.new('RGB', (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)

    # 3 Top Columns
    col_w = 750
    col_h = 680
    top_y = 20

    # Column 1: TRADITIONAL AAC APPROACH (Red)
    draw.rounded_rectangle([30, top_y, 30 + col_w, top_y + col_h], radius=24, fill=(254, 242, 242), outline=(254, 205, 211), width=3)
    draw.rounded_rectangle([60, top_y + 25, 30 + col_w - 30, top_y + 90], radius=16, fill=(190, 18, 60))
    draw.text((80, top_y + 40), "TRADITIONAL AAC APPROACH", font=font_card_title, fill=C_WHITE)
    draw.text((450, top_y + 42), "(Deficit & Masking)", font=font_badge, fill=(254, 205, 211))

    red_bullets = [
        "Unilateral Masking Focus: Forces autistic youth to mimic neurotypical norms, leading to autistic burnout.",
        "Prohibitive Hardware Cost: Dedicated AAC devices (Dynavox) cost $4,000–$8,000 with long insurance delays.",
        "One-Way Static Output: Rigid icon grids speak words out loud but provide zero subtext or intent translation.",
        "Blind to Situational Mutism: Assumes user can coordinate motor menus during acute sensory shutdowns.",
        "Naive AI Gaslighting: Generic chatbots mistake hostile bullying ('nobody likes you') for friendly idioms."
    ]
    by = top_y + 120
    for b in red_bullets:
        draw.ellipse([70, by + 4, 96, by + 30], fill=(225, 29, 72))
        draw.text((79, by + 6), "X", font=font_badge, fill=C_WHITE)
        parts = b.split(': ')
        draw.text((115, by), parts[0] + ":", font=font_body_bold, fill=(15, 23, 42))
        # Wrap text
        words = parts[1].split(' ')
        line1, line2 = '', ''
        for w in words:
            if len(line1 + w) < 55: line1 += w + ' '
            else: line2 += w + ' '
        draw.text((115, by + 28), line1.strip(), font=font_body, fill=(51, 65, 85))
        if line2: draw.text((115, by + 54), line2.strip(), font=font_body, fill=(51, 65, 85))
        by += 108

    # Column 2: NEUROBRIDGE DUAL-ENGINE (Green)
    draw.rounded_rectangle([820, top_y, 820 + col_w, top_y + col_h], radius=24, fill=(240, 253, 244), outline=(187, 247, 208), width=3)
    draw.rounded_rectangle([850, top_y + 25, 820 + col_w - 30, top_y + 90], radius=16, fill=(4, 120, 87))
    draw.text((870, top_y + 40), "NEUROBRIDGE DUAL-ENGINE", font=font_card_title, fill=C_WHITE)
    draw.text((1270, top_y + 42), "(Double Empathy AI)", font=font_badge, fill=(187, 247, 208))

    grn_bullets = [
        "Reciprocal Subtext Translation: Translates idioms for autistic wearers and directness for neurotypical peers.",
        "Ubiquitous Zero-Cost Hardware: Operates in browser on existing laptops/smartphones (https://hack2health.vercel.app).",
        "4-in-1 Multimodal Timeline: Unifies Speech, Switch-Scanning, AAC Chips, and 3D MediaPipe Stim Gestures.",
        "Wearer-Sovereign Safety Net: On-demand GPS & Communication Passport dispatch without 24/7 surveillance.",
        "Anti-Gaslighting Hostility Shield: Detects malicious insults and protects against Rejection Dysphoria (RSD)."
    ]
    by = top_y + 120
    for b in grn_bullets:
        draw.ellipse([860, by + 4, 886, by + 30], fill=(16, 185, 129))
        draw.text((867, by + 6), "✓", font=font_badge, fill=C_WHITE)
        parts = b.split(': ')
        draw.text((905, by), parts[0] + ":", font=font_body_bold, fill=(15, 23, 42))
        words = parts[1].split(' ')
        line1, line2 = '', ''
        for w in words:
            if len(line1 + w) < 55: line1 += w + ' '
            else: line2 += w + ' '
        draw.text((905, by + 28), line1.strip(), font=font_body, fill=(51, 65, 85))
        if line2: draw.text((905, by + 54), line2.strip(), font=font_body, fill=(51, 65, 85))
        by += 108

    # Column 3: THE PROBLEM WE SOLVE (Purple)
    draw.rounded_rectangle([1610, top_y, 1610 + col_w, top_y + col_h], radius=24, fill=(250, 245, 255), outline=(233, 213, 255), width=3)
    draw.rounded_rectangle([1640, top_y + 25, 1610 + col_w - 30, top_y + 90], radius=16, fill=(109, 40, 217))
    draw.text((1660, top_y + 40), "THE PROBLEM WE SOLVE", font=font_card_title, fill=C_WHITE)
    draw.text((2070, top_y + 42), "(The Social Cliff)", font=font_badge, fill=(233, 213, 255))

    pur_bullets = [
        "The 40% Segregation Cliff: Over 40% of autistic students spend school in segregated classes (NCES Data).",
        "Abrupt Support Termination: Transition to college brings sudden loss of 1:1 paraprofessional aides.",
        "Situational Mutism In Crises: High sensory environments (cafeterias >75dB) cause complete vocal speech loss.",
        "Masking & Autistic Burnout: Forcing neurotypical imitation causes chronic fatigue, anxiety, and depression.",
        "Dignified Healthcare Mission: Empowering autonomous social agency and mutual cross-neurotype respect."
    ]
    by = top_y + 120
    for b in pur_bullets:
        draw.ellipse([1650, by + 4, 1676, by + 30], fill=(147, 51, 234))
        draw.text((1657, by + 6), "🎯", font=font_badge, fill=C_WHITE)
        parts = b.split(': ')
        draw.text((1695, by), parts[0] + ":", font=font_body_bold, fill=(15, 23, 42))
        words = parts[1].split(' ')
        line1, line2 = '', ''
        for w in words:
            if len(line1 + w) < 55: line1 += w + ' '
            else: line2 += w + ' '
        draw.text((1695, by + 28), line1.strip(), font=font_body, fill=(51, 65, 85))
        if line2: draw.text((1695, by + 54), line2.strip(), font=font_body, fill=(51, 65, 85))
        by += 108

    # BOTTOM SECTION: 8-Step Multimodal Loop
    loop_y = 740
    lt = "OUR MULTIMODAL ASSISTIVE INTELLIGENCE LOOP"
    draw.text(((W - draw.textlength(lt, font=font_card_title)) // 2, loop_y), lt, font=font_card_title, fill=(15, 23, 42))

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

    sw = 240
    sgap = 45
    sx_start = 80
    for idx, (num, st, sd) in enumerate(steps):
        sx = sx_start + idx * (sw + sgap)
        # Circle
        draw.ellipse([sx + 85, loop_y + 55, sx + 155, loop_y + 125], fill=(37, 99, 235) if idx < 4 else (147, 51, 234))
        draw.text((sx + 112, loop_y + 78), num, font=font_step_num, fill=C_WHITE)

        # Arrow
        if idx < 7:
            ax = sx + 175
            draw.line([ax, loop_y + 90, ax + 85, loop_y + 90], fill=(148, 163, 184), width=4)
            draw.polygon([(ax + 85, loop_y + 82), (ax + 100, loop_y + 90), (ax + 85, loop_y + 98)], fill=(148, 163, 184))

        # Title & desc
        draw.text((sx + (sw - draw.textlength(st, font=font_badge)) // 2, loop_y + 145), st, font=font_badge, fill=(15, 23, 42))
        lines = sd.split('\n')
        for l_idx, l in enumerate(lines):
            draw.text((sx + (sw - draw.textlength(l, font=font_small)) // 2, loop_y + 175 + l_idx * 24), l, font=font_small, fill=C_MUTED)

    # Adaptive bar at bottom
    draw.rounded_rectangle([300, 1080, 2100, 1160], radius=20, fill=(30, 27, 75))
    ab_txt = "⚡ AI ADAPTIVE DUAL-ENGINE: Continuously personalizes vocabulary & suppresses downvoted idioms via real-time feedback"
    draw.text(((W - draw.textlength(ab_txt, font=font_card_title)) // 2, 1105), ab_txt, font=font_card_title, fill=C_WHITE)

    fn = 'sih_generated/main_s1.png'
    im.save(fn)
    return fn

# Slide 2: Technical Approach Main Graphic (2400x1200)
def make_main_s2():
    W, H = 2400, 1200
    im = Image.new('RGB', (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)

    col_w = 440
    col_gap = 40
    start_x = 30
    top_y = 30
    col_h = 1120

    stages = [
        ("DATA SOURCES", (37, 99, 235), (239, 246, 255), [
            ("Spoken Audio Stream", "Web Speech API streaming raw acoustic conversation in-browser."),
            ("Single-Switch Scanning", "Accessible scanning keyboard for fine motor & apraxia support."),
            ("Typed AAC Symbol Chips", "Pre-configured rapid non-verbal communication symbol cards."),
            ("3D Hand Stim Tracking", "Google MediaPipe 21-joint 3D kinematic landmark vectors."),
            ("Sensory Radar Decibels", "Web Audio API real-time acoustic sound pressure (SPL) meter.")
        ]),
        ("DATA PROCESSING", (13, 148, 136), (240, 253, 250), [
            ("Multimodal Ingestion", "Unified stream normalization via centralized /api/analyze route."),
            ("Kinematic Buffer", "12-frame rolling buffer (~800ms) tracking velocity & reversals."),
            ("Fingertip Curl Check", "Biometric angle verification eliminates resting hand false alarms."),
            ("Disfluency Cleansing", "Speech filler removal extracts core emotional sentiment accurately."),
            ("Session State Cache", "Client cache persists calibrated gestures & emergency profile.")
        ]),
        ("PREDICTION ENGINE", (147, 51, 234), (250, 245, 255), [
            ("Google Gemini 2.5 Flash", "Primary LLM: deep pragmatic subtext resolution & reasoning."),
            ("Offline Regex Engine", "Zero-downtime heuristic fallback for transit tunnels & basements."),
            ("Double Empathy Rules", "Bidirectional classifier: idiom, sarcasm, bluntness, and intent."),
            ("Anti-Gaslighting Shield", "Hostility detection: warns of bullying, refuses to excuse abuse."),
            ("Adaptive Feedback Loop", "Downvoting idioms personalizes clarification frequency live.")
        ]),
        ("SOVEREIGN OUTPUTS", (217, 119, 6), (254, 252, 232), [
            ("Subtext Clarification", "Real-time contextual meaning cards rendered in conversation."),
            ("Sovereign Safety Net", "Instant GPS coordinates & situational mutism alert dispatch."),
            ("Communication Passport", "Digital medical ID for first responders, teachers, and peers."),
            ("Tactful Exit Cards", "One-tap pre-rehearsed boundary cards preventing burnout."),
            ("Peer Circles & Wingman", "Parallel-play virtual study rooms with zero small-talk demands.")
        ]),
        ("TECHNOLOGIES USED", (16, 185, 129), (240, 253, 244), [
            ("Frontend Application", "React 19, Vite 8.3, Custom Glassmorphism CSS Design System."),
            ("Backend Architecture", "Node.js, Express.js REST API, Server-Sent Events (SSE)."),
            ("AI & Computer Vision", "Google Gemini 2.5 Flash, MediaPipe Vision WebAssembly."),
            ("Assistive APIs", "Web Speech API, DeviceMotion API (G-force), Geolocation API."),
            ("Deployment & DevOps", "Vercel Edge Serverless, GitHub CI/CD, 18 Automated Self-Tests.")
        ])
    ]

    for c_idx, (chdr, ccolor, cbg, cards) in enumerate(stages):
        cx = start_x + c_idx * (col_w + col_gap)
        draw.rounded_rectangle([cx, top_y, cx + col_w, top_y + col_h], radius=20, fill=cbg, outline=C_SLATE_BORDER, width=2)
        
        # Header
        draw.rounded_rectangle([cx + 20, top_y + 20, cx + col_w - 20, top_y + 85], radius=14, fill=ccolor)
        draw.text((cx + (col_w - draw.textlength(chdr, font=font_card_title)) // 2, top_y + 36), chdr, font=font_card_title, fill=C_WHITE)

        # 5 Cards
        cy = top_y + 115
        for ctitle, cdesc in cards:
            draw.rounded_rectangle([cx + 20, cy, cx + col_w - 20, cy + 180], radius=14, fill=C_WHITE, outline=(203, 213, 225), width=2)
            draw.text((cx + 40, cy + 20), ctitle, font=font_card_title, fill=(15, 23, 42))
            
            words = cdesc.split(' ')
            l1, l2, l3 = '', '', ''
            for w in words:
                if len(l1 + w) < 32: l1 += w + ' '
                elif len(l2 + w) < 32: l2 += w + ' '
                else: l3 += w + ' '
            draw.text((cx + 40, cy + 65), l1.strip(), font=font_body, fill=C_MUTED)
            if l2: draw.text((cx + 40, cy + 100), l2.strip(), font=font_body, fill=C_MUTED)
            if l3: draw.text((cx + 40, cy + 135), l3.strip(), font=font_body, fill=C_MUTED)
            cy += 198

        # Arrow to next
        if c_idx < 4:
            arr_x = cx + col_w + 8
            draw.line([arr_x, top_y + 560, arr_x + 22, top_y + 560], fill=(37, 99, 235), width=6)
            draw.polygon([(arr_x + 22, top_y + 548), (arr_x + 36, top_y + 560), (arr_x + 22, top_y + 572)], fill=(37, 99, 235))

    fn = 'sih_generated/main_s2.png'
    im.save(fn)
    return fn

# Slide 3: Feasibility & Viability Main Graphic (2400x1200)
def make_main_s3():
    W, H = 2400, 1200
    im = Image.new('RGB', (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)

    rows = [
        ("✔ FEASIBILITY", (4, 120, 87), (240, 253, 244), (187, 247, 208), [
            ("Zero Hardware Barrier", "Runs on ubiquitous web browsers (Chrome, Safari, Edge) on existing student phones and laptops. Eliminates $7,000 proprietary hardware barriers completely."),
            ("Production Proven Today", "Live full-stack deployment active on Vercel at https://hack2health.vercel.app with instant edge execution across worldwide edge nodes."),
            ("Cost & Scale Efficiency", "Serverless micro-architecture executes Gemini 2.5 Flash only on demand, costing <$0.01 per conversation with zero idle infrastructure cost.")
        ]),
        ("⚠ KEY CHALLENGES", (190, 18, 60), (254, 242, 242), (254, 205, 211), [
            ("High Acoustic Noise", "Cafeteria background chatter (75–85 dB) degrades standard browser microphone speech recognition accuracy during social transitions."),
            ("Mobile OS Sensor Throttling", "Mobile Android and iOS operating systems suspend background browser tab sensors and camera feeds when the screen is locked."),
            ("AAC Typo & Lexical Noise", "Autistic disfluency, dyspraxia, or rapid typing generates phonetic spelling errors ('neeeed a brek') that bypass simple regex matching.")
        ]),
        ("🎯 OUR STRATEGY", (29, 78, 216), (239, 246, 255), (191, 219, 254), [
            ("Multimodal Input Fallback", "When noise peaks on the Sensory Radar, the wearer seamlessly shifts to single-switch scanning or one-tap quick-response AAC chips with zero downtime."),
            ("Native Daemon Packaging", "Phase 3 roadmap packages the web app into a Capacitor/React Native daemon with an Android Foreground Service for locked-screen fall monitoring."),
            ("LLM Intent Reconstruction", "Gemini 2.5 Flash semantically extracts the core emotional/functional intent from disjointed spelling without judging grammar or penalizing the user.")
        ])
    ]

    ry = 30
    rh = 360
    for rtitle, rcolor, rbg, rborder, cards in rows:
        draw.rounded_rectangle([30, ry, 2370, ry + rh], radius=24, fill=rbg, outline=rborder, width=3)
        draw.rounded_rectangle([60, ry + 20, 420, ry + 80], radius=16, fill=rcolor)
        draw.text((85, ry + 32), rtitle, font=font_sec, fill=C_WHITE)

        cw = 740
        cx_start = 60
        for c_idx, (ctitle, cdesc) in enumerate(cards):
            cx = cx_start + c_idx * 770
            draw.rounded_rectangle([cx, ry + 105, cx + cw, ry + rh - 25], radius=16, fill=C_WHITE, outline=rborder, width=2)
            draw.text((cx + 30, ry + 125), "• " + ctitle, font=font_card_title, fill=rcolor)
            
            # Multi-line wrap
            words = cdesc.split(' ')
            l1, l2, l3 = '', '', ''
            for w in words:
                if len(l1 + w) < 55: l1 += w + ' '
                elif len(l2 + w) < 55: l2 += w + ' '
                else: l3 += w + ' '
            draw.text((cx + 30, ry + 170), l1.strip(), font=font_body, fill=(30, 41, 59))
            if l2: draw.text((cx + 30, ry + 205), l2.strip(), font=font_body, fill=(30, 41, 59))
            if l3: draw.text((cx + 30, ry + 240), l3.strip(), font=font_body, fill=(30, 41, 59))

        ry += rh + 30

    fn = 'sih_generated/main_s3.png'
    im.save(fn)
    return fn

# Slide 4: Impact & Benefits Main Graphic (2400x1200)
def make_main_s4():
    W, H = 2400, 1200
    im = Image.new('RGB', (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)

    sections = [
        ("👥 POTENTIAL IMPACT ON TARGET AUDIENCE", (29, 78, 216), (239, 246, 255), (191, 219, 254), [
            ("AUTISTIC YOUTH (AGES 14-24)", "Overcoming The Social Cliff", [
                "Eliminates reliance on 1:1 human aides upon high school graduation.",
                "Prevents situational mutism panic via one-tap AAC and stim gestures.",
                "Tactful Exit Cards lower autistic masking burnout and social anxiety.",
                "Empowers genuine self-advocacy and dignified boundary setting."
            ]),
            ("PARENTS & GUARDIANS", "Sovereign Peace of Mind", [
                "Real-time GPS safe perimeter telemetry streaming on Guardian View.",
                "Immediate automated alert dispatch during acute sensory overload crises.",
                "Zero invasive 24/7 spying: telemetry transmitted only by wearer consent.",
                "Direct emergency phone dialer with verified coordinates & sound levels."
            ]),
            ("EDUCATORS & PEERS", "Mutual Understanding (Double Empathy)", [
                "Educates neurotypical peers: directness is constructive honesty, not rudeness.",
                "Reframes hand stimming as joyous self-regulation rather than a crisis.",
                "Equips campus accessibility offices with Digital Communication Passports.",
                "Fosters inclusive parallel-play study and co-working environments."
            ])
        ]),
        ("✔ BENEFITS OF THE SOLUTION", (4, 120, 87), (240, 253, 244), (187, 247, 208), [
            ("SOCIAL BENEFITS", "Inclusion Without Forced Masking", [
                "Fosters authentic neurodivergent friendships without social camouflage.",
                "Social Wingman matches intense shared passions (keyboards, transit).",
                "Replaces social ambiguity with predictable, structured interactions.",
                "Destigmatizes somatic stimming and AAC communication in public spaces."
            ]),
            ("ECONOMIC BENEFITS", "Democratizing $7,000 Medical Tech", [
                "Saves families $4,000–$8,000 per user vs proprietary dedicated hardware.",
                "Reduces institutional special education paraprofessional staffing costs.",
                "Zero subscription paywall: free open-access browser prototype.",
                "Runs on existing student hardware without insurance pre-approvals."
            ]),
            ("HEALTHCARE & CLINICAL BENEFITS", "Preventative Mental Health", [
                "Drastically reduces chronic autistic burnout, anxiety, and depression.",
                "Reduces hospitalizations caused by acute sensory panic disorientations.",
                "Equips first responders with vital non-verbal medical crisis profiles.",
                "18 automated self-tests guarantee verified API and system robustness."
            ])
        ])
    ]

    sy = 30
    sh = 550
    for stitle, scolor, sbg, sborder, cols in sections:
        draw.rounded_rectangle([30, sy, 2370, sy + sh], radius=24, fill=sbg, outline=sborder, width=3)
        draw.rounded_rectangle([60, sy + 20, 850, sy + 80], radius=16, fill=scolor)
        draw.text((85, sy + 32), stitle, font=font_sec, fill=C_WHITE)

        cw = 740
        cx_start = 60
        for c_idx, (ctitle, csub, cpts) in enumerate(cols):
            cx = cx_start + c_idx * 770
            draw.rounded_rectangle([cx, sy + 100, cx + cw, sy + sh - 25], radius=16, fill=C_WHITE, outline=sborder, width=2)
            draw.text((cx + 30, sy + 120), ctitle, font=font_card_title, fill=scolor)
            draw.text((cx + 30, sy + 155), csub, font=font_badge, fill=C_MUTED)
            
            py = sy + 195
            for pt in cpts:
                draw.text((cx + 30, py), "• " + pt[:55], font=font_body, fill=(15, 23, 42))
                if len(pt) > 55:
                    draw.text((cx + 45, py + 26), pt[55:], font=font_body, fill=(15, 23, 42))
                    py += 54
                else:
                    py += 44

        sy += sh + 35

    fn = 'sih_generated/main_s4.png'
    im.save(fn)
    return fn

# Slide 5: Research & References Main Graphic (2400x1200)
def make_main_s5():
    W, H = 2400, 1200
    im = Image.new('RGB', (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(im)

    col_w = 1140
    top_y = 30
    col_h = 1140

    # Left Column: Peer-Reviewed Scientific Literature
    draw.rounded_rectangle([30, top_y, 30 + col_w, top_y + col_h], radius=24, fill=(250, 245, 255), outline=(233, 213, 255), width=3)
    draw.rounded_rectangle([60, top_y + 20, 30 + col_w - 30, top_y + 80], radius=16, fill=(109, 40, 217))
    draw.text((85, top_y + 32), "📚 PEER-REVIEWED CLINICAL & SCIENTIFIC LITERATURE", font=font_sec, fill=C_WHITE)

    refs = [
        ("1. The Double Empathy Problem (Milton, 2012)",
         "Milton, D. E. (2012). 'On the ontological status of autism: the double empathy problem.' Disability & Society, 27(6), 883-887.",
         "https://doi.org/10.1080/09687599.2012.710008",
         "Theoretical core: Proves cross-neurotype miscommunication is a reciprocal two-way mismatch, not an autistic deficit to be masked."),

        ("2. Educational Segregation & The Social Cliff (NCES, 2024)",
         "U.S. Dept. of Education, National Center for Education Statistics. Digest of Education Statistics, Table 204.60 & IDEA Section 618.",
         "https://nces.ed.gov/programs/digest/d23/tables/dt23_204.60.asp",
         "Sourced demographic data: Over 40% of autistic students are segregated in K-12 schooling, facing the abrupt Social Cliff upon transition."),

        ("3. Defining Autistic Burnout & Camouflaging (Raymaker et al., 2020)",
         "Raymaker, D. M., et al. (2020). 'Having All of Your Internal Resources Exhausted: Defining Autistic Burnout.' Autism in Adulthood, 2(2), 132-143.",
         "https://doi.org/10.1089/aut.2019.0079",
         "Clinical foundation for Tactful Exit Cards: Demonstrates that continuous masking leads to severe cognitive and functional exhaustion."),

        ("4. Rejection Sensitive Dysphoria & Neurodivergence",
         "Bedrossian, L. (2021). 'Understand and address rejection sensitive dysphoria.' Mental Health Practice, 24(6).",
         "https://doi.org/10.7748/mhp.2021.e1564",
         "Directly guides our Anti-Gaslighting Hostility Shield: Protects wearers from misinterpreting abusive insults as benign idioms.")
    ]

    ry = top_y + 110
    for rtitle, rcit, rlink, rimp in refs:
        draw.rounded_rectangle([60, ry, 30 + col_w - 30, ry + 235], radius=16, fill=C_WHITE, outline=(233, 213, 255), width=2)
        draw.text((85, ry + 15), rtitle, font=font_card_title, fill=(109, 40, 217))
        draw.text((85, ry + 52), rcit[:85], font=font_small, fill=(15, 23, 42))
        if len(rcit) > 85: draw.text((85, ry + 76), rcit[85:], font=font_small, fill=(15, 23, 42))
        draw.text((85, ry + 105), "Link: " + rlink, font=font_small, fill=(29, 78, 216))
        draw.text((85, ry + 135), "Healthcare Impact: " + rimp[:75], font=font_small, fill=C_MUTED)
        if len(rimp) > 75: draw.text((85, ry + 159), rimp[75:], font=font_small, fill=C_MUTED)
        ry += 252

    # Right Column: Technical Documentation & Live Assets
    draw.rounded_rectangle([1230, top_y, 1230 + col_w, top_y + col_h], radius=24, fill=(239, 246, 255), outline=(191, 219, 254), width=3)
    draw.rounded_rectangle([1260, top_y + 20, 1230 + col_w - 30, top_y + 80], radius=16, fill=(29, 78, 216))
    draw.text((1285, top_y + 32), "🌐 LIVE PLATFORM, OPEN-SOURCE CODE & SYSTEM ASSETS", font=font_sec, fill=C_WHITE)

    techs = [
        ("Live Deployed Application", "https://hack2health.vercel.app", "Active production deployment with Google Gemini 2.5 Flash LLM integration."),
        ("Mobile Guardian Safety Companion", "https://hack2health.vercel.app/?view=guardian", "Live real-time telemetry dashboard streaming GPS coordinates & decibel readings."),
        ("Official GitHub Repository", "https://github.com/tharunya0105-afk/hack2health", "Full open-source codebase with React 19 frontend, Express backend & gesture modules."),
        ("Automated End-to-End Test Suite", "backend/test-suite.js", "18 automated tests verifying multimodal ingestion, scanning keyboards & adversarial speech."),
        ("Complete Video Walkthrough", "gallery/neurobridge_demo_video.mp4", "1.63-minute 30FPS MP4 video walkthrough covering all 15 system capabilities."),
        ("Google MediaPipe Vision Tasks", "https://developers.google.com/mediapipe/solutions/vision/hand_landmarker", "Float16 WebAssembly vision model tracking 21 3D landmarks in real time.")
    ]

    ty = top_y + 110
    for ttitle, turl, tdesc in techs:
        draw.rounded_rectangle([1260, ty, 1230 + col_w - 30, ty + 155], radius=16, fill=C_WHITE, outline=(191, 219, 254), width=2)
        draw.text((1285, ty + 15), "• " + ttitle, font=font_card_title, fill=(15, 23, 42))
        draw.text((1285, ty + 55), turl, font=font_body_bold, fill=(29, 78, 216))
        draw.text((1285, ty + 95), tdesc, font=font_small, fill=C_MUTED)
        ty += 170

    fn = 'sih_generated/main_s5.png'
    im.save(fn)
    return fn

print('Generating high-res graphics...')
f_t1 = make_title_banner_s1()
f_m1 = make_main_s1()
f_m2 = make_main_s2()
f_m3 = make_main_s3()
f_m4 = make_main_s4()
f_m5 = make_main_s5()
print('All high-res graphics generated.')

# =========================================================================
# Rebuild PPTX directly on top of SIH-01.pptx preserving master template
# =========================================================================
prs = pptx.Presentation('SIH-01.pptx')

# 1. Update Oval on ALL 5 slides with S. Tharunya
for idx, slide in enumerate(prs.slides):
    for shape in slide.shapes:
        if shape.name.startswith('Oval') or shape.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.AUTO_SHAPE and shape.auto_shape_type == pptx.enum.shapes.MSO_SHAPE.OVAL:
            tf = shape.text_frame
            tf.word_wrap = True
            for p in tf.paragraphs:
                p.text = ''
            p1 = tf.paragraphs[0]
            p1.text = "Leader:\nS. Tharunya"
            p1.font.size = Pt(10)
            p1.font.bold = True
            p1.font.color.rgb = RGBColor(15, 23, 42)
            p1.alignment = PP_ALIGN.CENTER

# 2. Replace pictures on each slide
# Slide 1: Picture 35 (Title), Picture 37 (Main)
s1 = prs.slides[0]
for shp in list(s1.shapes):
    if shp.name == 'Picture 35':
        left, top, w, h = shp.left, shp.top, shp.width, shp.height
        s1.shapes._spTree.remove(shp._element)
        s1.shapes.add_picture(f_t1, left, top, width=w, height=h)
    elif shp.name == 'Picture 37':
        left, top, w, h = shp.left, shp.top, shp.width, shp.height
        s1.shapes._spTree.remove(shp._element)
        s1.shapes.add_picture(f_m1, left, top, width=w, height=h)

# Slide 2: Picture 4 (Main)
s2 = prs.slides[1]
for shp in list(s2.shapes):
    if shp.name == 'Picture 4':
        left, top, w, h = shp.left, shp.top, shp.width, shp.height
        s2.shapes._spTree.remove(shp._element)
        s2.shapes.add_picture(f_m2, left, top, width=w, height=h)

# Slide 3: Picture 12 (Main)
s3 = prs.slides[2]
for shp in list(s3.shapes):
    if shp.name == 'Picture 12':
        left, top, w, h = shp.left, shp.top, shp.width, shp.height
        s3.shapes._spTree.remove(shp._element)
        s3.shapes.add_picture(f_m3, left, top, width=w, height=h)

# Slide 4: Picture 7 (Main)
s4 = prs.slides[3]
for shp in list(s4.shapes):
    if shp.name == 'Picture 7':
        left, top, w, h = shp.left, shp.top, shp.width, shp.height
        s4.shapes._spTree.remove(shp._element)
        s4.shapes.add_picture(f_m4, left, top, width=w, height=h)

# Slide 5: Picture 17 (Main)
s5 = prs.slides[4]
for shp in list(s5.shapes):
    if shp.name == 'Picture 17':
        left, top, w, h = shp.left, shp.top, shp.width, shp.height
        s5.shapes._spTree.remove(shp._element)
        s5.shapes.add_picture(f_m5, left, top, width=w, height=h)

FINAL_PPTX = 'Hack2Heal_2.0_NeuroBridge_SIH_Final.pptx'
FINAL_PDF = 'Hack2Heal_2.0_NeuroBridge_SIH_Final.pdf'

prs.save(FINAL_PPTX)
print(f'Saved updated presentation directly into template: {FINAL_PPTX}')

# Export to PDF via PowerPoint COM
try:
    import win32com.client
    ppt = win32com.client.Dispatch('PowerPoint.Application')
    deck_path = os.path.abspath(FINAL_PPTX)
    pdf_path = os.path.abspath(FINAL_PDF)
    pres = ppt.Presentations.Open(deck_path, True, False, False)
    pres.SaveAs(pdf_path, 32)
    pres.Close()
    ppt.Quit()
    print(f'Exported to PDF: {FINAL_PDF} ({os.path.getsize(FINAL_PDF)/(1024*1024):.2f} MB)')
except Exception as e:
    print('PDF export warning:', e)
