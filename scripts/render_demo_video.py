import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import glob
import os

W, H = 1264, 848
FPS = 30
OUTPUT_PATH = 'gallery/neurobridge_demo_video.mp4'

font_title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 38)
font_subtitle = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 22)
font_card = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 24)
font_sub = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 18)
font_badge = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 15)

slides_config = [
    {
        'type': 'intro',
        'title': 'NeuroBridge: LifeConnect & SocialOrbit',
        'subtitle': 'National Level Hack2Health 2.0 Submission',
        'tagline': 'Wearer-Controlled Multimodal Communication Bridge & Sovereign Safety Net',
        'meta': 'Live Prototype: https://hack2health.vercel.app | Built for Autistic Youth (Ages 14-24)',
        'duration_sec': 5.0
    },
    {
        'img': 'gallery/01_live_conversation_bridge.jpg',
        'badge': 'SCENE 1: LIVE CONVERSATION ASSIST',
        'title': 'Bidirectional Subtext Clarification Grounded in Double Empathy',
        'caption': 'Translates idioms for autistic wearers and directness for neurotypical peers in real time.',
        'duration_sec': 6.0
    },
    {
        'img': 'gallery/10_double_empathy_theory.jpg',
        'badge': 'SCIENTIFIC FOUNDATION: DR. DAMIAN MILTON (2012)',
        'title': 'The Double Empathy Problem: Two-Way Mismatch vs Deficit Model',
        'caption': 'Reframes autism communication as a mutual reciprocal gap, not an autistic deficit to be masked.',
        'duration_sec': 6.0
    },
    {
        'img': 'gallery/15_multimodal_timeline_unification.jpg',
        'badge': 'MULTIMODAL INGESTION ARCHITECTURE',
        'title': '4 Input Modalities Streamed into One Real-Time Timeline',
        'caption': 'Speech, Switch-Scanning Keyboard, Typed AAC, and Kinematic Stims unified with AI engine tags.',
        'duration_sec': 6.0
    },
    {
        'img': 'gallery/02_kinematic_gesture_translation.jpg',
        'badge': 'SCENE 2: KINEMATIC GESTURE TRANSLATION',
        'title': 'MediaPipe 21-Joint 3D Hand Tracking + 800ms Kinematic Buffer',
        'caption': 'Distinguishes happy regulatory stimming from genuine sensory distress via velocity analysis.',
        'duration_sec': 6.0
    },
    {
        'img': 'gallery/06_sensory_radar_monitor.jpg',
        'badge': 'SCENE 3: SENSORY RADAR & ACOUSTIC MONITOR',
        'title': 'Real-Time Sound Pressure Decibel (SPL) & Noise Spectrum',
        'caption': 'Monitors ambient cafeteria noise and alerts wearer before sensory overload causes shutdown.',
        'duration_sec': 5.5
    },
    {
        'img': 'gallery/07_switch_scanning_aac.jpg',
        'badge': 'ACCESSIBILITY MOTOR SUPPORT',
        'title': 'Single-Switch Scanning On-Screen AAC Keyboard',
        'caption': 'Frequency-grouped layout with adjustable dwell timers (0.8s-1.8s) for fine-motor independence.',
        'duration_sec': 5.5
    },
    {
        'img': 'gallery/08_tactful_exit_card.jpg',
        'badge': 'DIGNIFIED BOUNDARY SETTING',
        'title': 'Wearer-Sovereign Tactful Exit Cards & Sensory Recharge',
        'caption': 'Enables graceful social boundaries without awkwardness, mitigating autistic masking burnout.',
        'duration_sec': 5.5
    },
    {
        'img': 'gallery/09_communication_passport.jpg',
        'badge': 'CRISIS PREPAREDNESS',
        'title': 'Digital Communication Passport & Crisis Identification Card',
        'caption': 'Equips wearers with non-verbal communication modes, sensory triggers, and emergency contacts.',
        'duration_sec': 5.5
    },
    {
        'img': 'gallery/11_mobile_guardian_view.jpg',
        'badge': 'SCENE 4: MOBILE GUARDIAN SAFETY COMPANION',
        'title': 'Mobile Responsive Live Telemetry (?view=guardian)',
        'caption': 'Streams live SSE alerts, decibel meter, battery status, and high-impact acceleration alerts.',
        'duration_sec': 5.5
    },
    {
        'img': 'gallery/03_guardian_safety_dashboard.jpg',
        'badge': 'WEARER-SOVEREIGN SAFETY NET',
        'title': 'Emergency GPS Map & Selective Dispatch (No Continuous Surveillance)',
        'caption': 'Transmits coordinates and situational mutism alert only upon wearer emergency trigger.',
        'duration_sec': 5.5
    },
    {
        'img': 'gallery/12_parallel_play_coworking.jpg',
        'badge': 'SCENE 5: LIFECONNECT SOCIAL ORBIT',
        'title': 'Parallel-Play Virtual Co-Working: Low-Demand Social Space',
        'caption': 'Side-by-side quiet study rooms with Pomodoro timers, lo-fi audio, and zero small talk demands.',
        'duration_sec': 6.0
    },
    {
        'img': 'gallery/04_social_orbit_peer_circles.jpg',
        'badge': 'AI SOCIAL SIMULATION LAB',
        'title': 'Boundary-Setting Rehearsal & Inclusive Community Circles',
        'caption': 'Low-stakes AI social rehearsal modules to practice navigating campus and workplace situations.',
        'duration_sec': 6.0
    },
    {
        'img': 'gallery/14_social_wingman_matching.jpg',
        'badge': 'SOCIAL WINGMAN ENGINE',
        'title': 'Special Interest Matching & Skip Small Talk Protocol',
        'caption': 'Connects autistic peers around deep passions with unscripted conversation starters.',
        'duration_sec': 6.0
    },
    {
        'img': 'gallery/13_automated_test_suite.jpg',
        'badge': 'ENGINEERING RIGOR & VERIFICATION',
        'title': '18 Automated Self-Tests: Transparent & Adversarial Evaluation',
        'caption': '16 passed live on Vercel production; honest documentation of edge cases and heuristic boundaries.',
        'duration_sec': 6.0
    },
    {
        'img': 'gallery/05_system_architecture_diagram.jpg',
        'badge': 'FULL-STACK TECHNICAL ARCHITECTURE',
        'title': 'Dual-Engine Orchestration Core: Gemini 2.5 Flash + Heuristics',
        'caption': 'Combines cloud LLM semantic depth with offline fallbacks and sovereign telemetry pipelines.',
        'duration_sec': 6.0
    },
    {
        'type': 'outro',
        'title': 'NeuroBridge: Bridging Worlds with Dignity',
        'subtitle': 'Healthcare & Accessibility Innovation Track - Hack2Health 2.0',
        'tagline': 'Live Web Application: https://hack2health.vercel.app',
        'meta': 'GitHub: github.com/tharunya0105-afk/hack2health | Thank you, Judges!',
        'duration_sec': 6.0
    }
]

def make_intro_frame(cfg):
    im = Image.new('RGB', (W, H), (10, 15, 28))
    draw = ImageDraw.Draw(im)
    
    # Outer glow border
    draw.rounded_rectangle([30, 30, W - 30, H - 30], radius=24, outline=(37, 99, 235), width=2)
    
    # Header badge
    draw.rounded_rectangle([(W // 2) - 220, 140, (W // 2) + 220, 185], radius=20, fill=(37, 99, 235))
    draw.text(((W // 2) - 190, 152), 'HACK2HEALTH 2.0 PROJECT DEMO', font=font_badge, fill=(255, 255, 255))
    
    # Title & Subtitle
    title_w = draw.textlength(cfg['title'], font=font_title)
    draw.text(((W - title_w) // 2, 240), cfg['title'], font=font_title, fill=(248, 250, 252))
    
    sub_w = draw.textlength(cfg['subtitle'], font=font_subtitle)
    draw.text(((W - sub_w) // 2, 320), cfg['subtitle'], font=font_subtitle, fill=(56, 189, 248))
    
    # Divider line
    draw.line([(W // 2) - 300, 380, (W // 2) + 300, 380], fill=(51, 65, 85), width=2)
    
    # Tagline & Meta
    tag_w = draw.textlength(cfg['tagline'], font=font_card)
    draw.text(((W - tag_w) // 2, 440), cfg['tagline'], font=font_card, fill=(226, 232, 240))
    
    # 4 Key Feature Pills
    features = ['Double Empathy AI', 'Kinematic Stims', 'Sovereign Safety Net', 'Peer Social Orbit']
    pill_w = 240
    start_x = (W - (len(features) * pill_w + (len(features) - 1) * 20)) // 2
    for i, feat in enumerate(features):
        px = start_x + i * (pill_w + 20)
        draw.rounded_rectangle([px, 530, px + pill_w, 585], radius=14, fill=(18, 24, 38), outline=(56, 189, 248), width=1)
        feat_w = draw.textlength(feat, font=font_sub)
        draw.text((px + (pill_w - feat_w) // 2, 545), feat, font=font_sub, fill=(241, 245, 249))
        
    meta_w = draw.textlength(cfg['meta'], font=font_sub)
    draw.text(((W - meta_w) // 2, 670), cfg['meta'], font=font_sub, fill=(148, 163, 184))
    
    return np.array(im)[:, :, ::-1] # RGB to BGR

def make_outro_frame(cfg):
    im = Image.new('RGB', (W, H), (10, 15, 28))
    draw = ImageDraw.Draw(im)
    
    draw.rounded_rectangle([30, 30, W - 30, H - 30], radius=24, outline=(16, 185, 129), width=2)
    
    draw.rounded_rectangle([(W // 2) - 180, 160, (W // 2) + 180, 205], radius=20, fill=(16, 185, 129))
    draw.text(((W // 2) - 150, 172), 'SUBMISSION COMPLETE', font=font_badge, fill=(255, 255, 255))
    
    title_w = draw.textlength(cfg['title'], font=font_title)
    draw.text(((W - title_w) // 2, 260), cfg['title'], font=font_title, fill=(248, 250, 252))
    
    sub_w = draw.textlength(cfg['subtitle'], font=font_subtitle)
    draw.text(((W - sub_w) // 2, 340), cfg['subtitle'], font=font_subtitle, fill=(52, 211, 153))
    
    draw.line([(W // 2) - 300, 400, (W // 2) + 300, 400], fill=(51, 65, 85), width=2)
    
    tag_w = draw.textlength(cfg['tagline'], font=font_card)
    draw.text(((W - tag_w) // 2, 470), cfg['tagline'], font=font_card, fill=(56, 189, 248))
    
    meta_w = draw.textlength(cfg['meta'], font=font_sub)
    draw.text(((W - meta_w) // 2, 550), cfg['meta'], font=font_sub, fill=(203, 213, 225))
    
    draw.rounded_rectangle([(W // 2) - 220, 640, (W // 2) + 220, 710], radius=16, fill=(30, 41, 59), outline=(51, 65, 85))
    draw.text(((W // 2) - 180, 662), 'Ready for Hackathon Judging Review', font=font_card, fill=(248, 250, 252))
    
    return np.array(im)[:, :, ::-1]

def make_slide_frame(cfg):
    base_im = Image.open(cfg['img']).convert('RGB')
    if base_im.size != (W, H):
        base_im = base_im.resize((W, H), Image.Resampling.LANCZOS)
        
    draw = ImageDraw.Draw(base_im)
    
    # Bottom HUD overlay banner
    hud_h = 100
    hud_y = H - hud_h - 15
    draw.rounded_rectangle([25, hud_y, W - 25, H - 15], radius=14, fill=(10, 15, 26), outline=(37, 99, 235), width=1)
    
    # Badge
    draw.rounded_rectangle([45, hud_y + 14, 45 + 320, hud_y + 42], radius=10, fill=(37, 99, 235))
    draw.text((55, hud_y + 19), cfg['badge'], font=font_badge, fill=(255, 255, 255))
    
    # Title
    draw.text((380, hud_y + 16), cfg['title'], font=font_card, fill=(248, 250, 252))
    
    # Caption
    draw.text((45, hud_y + 55), cfg['caption'], font=font_sub, fill=(203, 213, 225))
    
    return np.array(base_im)[:, :, ::-1]

print('Rendering frames and building video with cv2...')
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(OUTPUT_PATH, fourcc, float(FPS), (W, H))

transition_frames = 15  # 0.5 sec crossfade

rendered_slides = []
for idx, cfg in enumerate(slides_config):
    if cfg.get('type') == 'intro':
        frame = make_intro_frame(cfg)
    elif cfg.get('type') == 'outro':
        frame = make_outro_frame(cfg)
    else:
        frame = make_slide_frame(cfg)
    rendered_slides.append((frame, int(cfg['duration_sec'] * FPS)))

total_frames = 0
for i in range(len(rendered_slides)):
    cur_frame, frame_count = rendered_slides[i]
    
    # Hold slide
    hold_frames = frame_count - transition_frames if i < len(rendered_slides) - 1 else frame_count
    for _ in range(hold_frames):
        out.write(cur_frame)
        total_frames += 1
        
    # Cross-fade to next slide if not last
    if i < len(rendered_slides) - 1:
        next_frame, _ = rendered_slides[i + 1]
        for t in range(transition_frames):
            alpha = (t + 1) / float(transition_frames)
            blended = cv2.addWeighted(cur_frame, 1.0 - alpha, next_frame, alpha, 0)
            out.write(blended)
            total_frames += 1

out.release()
duration_sec = total_frames / FPS
file_size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
print(f'Done! Successfully generated {OUTPUT_PATH}')
print(f'Total frames: {total_frames} | Duration: {duration_sec:.1f}s ({duration_sec/60:.2f} min) | Size: {file_size_mb:.2f} MB')
