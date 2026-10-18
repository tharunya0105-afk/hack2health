from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1264, 848
font_title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 34)
font_subtitle = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 19)
font_card_title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 21)
font_body = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 16)
font_badge = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 14)
font_large_num = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 30)

os.makedirs('gallery', exist_ok=True)

# ==========================================
# 14: Social Wingman Special Interest Matcher
# ==========================================
im14 = Image.new('RGB', (W, H), (11, 15, 25))
draw14 = ImageDraw.Draw(im14)

# Header banner
draw14.rounded_rectangle([40, 30, W - 40, 110], radius=16, fill=(18, 24, 38), outline=(37, 99, 235), width=1)
draw14.text((65, 45), 'NeuroBridge Social Wingman: Interest-Bridging Hub', font=font_title, fill=(248, 250, 252))
draw14.text((65, 83), 'Deep-Dive Connection Engine | Low-Demand Conversation Starters | Skip Small Talk Protocol', font=font_subtitle, fill=(148, 163, 184))

# Status pill
draw14.rounded_rectangle([W - 270, 52, W - 65, 88], radius=18, fill=(16, 185, 129))
draw14.text((W - 245, 60), 'STATUS: ACTIVE PAIRING', font=font_badge, fill=(255, 255, 255))

# 3 Match Cards
card_w = (W - 80 - 40) // 3
card_y1 = 135
card_y2 = 680

cards_data = [
    {
        'match': '96% Match',
        'color': (59, 130, 246),
        'title': 'Transit Systems & Rail Topology',
        'partner': 'Partner: Maya Chen (she/her)',
        'style': 'Communication: Factual & Asynchronous',
        'prompts': [
            'Did you see the new CBTC signal upgrades?',
            'Comparing Tokyo Yamanote vs NYC Subway routing',
            'Low-pressure timetable analysis'
        ],
        'badge': 'DEEP DIVE PASSION'
    },
    {
        'match': '92% Match',
        'color': (168, 85, 247),
        'title': 'Custom Mechanical Keyboards',
        'partner': 'Partner: Liam Patel (they/them)',
        'style': 'Communication: Info-Dumping Welcome',
        'prompts': [
            'Tactile vs Linear: 62g spring weighting debate',
            'Acoustic damping with silicone gaskets',
            'PCB hot-swap socket engineering'
        ],
        'badge': 'SPECIAL INTEREST'
    },
    {
        'match': '88% Match',
        'color': (20, 184, 166),
        'title': 'Parallel-Play Coding & Math',
        'partner': 'Partner: Sarah Al-Mansoor (she/her)',
        'style': 'Communication: Quiet Side-by-Side Work',
        'prompts': [
            'Joined 25-minute quiet sprint',
            'Zero small talk requirement',
            'Share snippets asynchronously'
        ],
        'badge': 'CO-WORKING CIRCLE'
    }
]

for i, c in enumerate(cards_data):
    cx1 = 40 + i * (card_w + 20)
    cx2 = cx1 + card_w
    # Card background
    draw14.rounded_rectangle([cx1, card_y1, cx2, card_y2], radius=16, fill=(18, 24, 38), outline=c['color'], width=2)
    
    # Badge
    draw14.rounded_rectangle([cx1 + 20, card_y1 + 20, cx1 + 190, card_y1 + 46], radius=13, fill=c['color'])
    draw14.text((cx1 + 30, card_y1 + 26), c['badge'], font=font_badge, fill=(255, 255, 255))
    
    # Match percentage
    draw14.text((cx2 - 160, card_y1 + 18), c['match'], font=font_large_num, fill=c['color'])
    
    # Title
    draw14.text((cx1 + 20, card_y1 + 65), c['title'], font=font_card_title, fill=(241, 245, 249))
    draw14.text((cx1 + 20, card_y1 + 105), c['partner'], font=font_body, fill=(203, 213, 225))
    draw14.text((cx1 + 20, card_y1 + 130), c['style'], font=font_body, fill=(148, 163, 184))
    
    # Divider
    draw14.line([cx1 + 20, card_y1 + 165, cx2 - 20, card_y1 + 165], fill=(51, 65, 85), width=1)
    
    # Starter Prompts
    draw14.text((cx1 + 20, card_y1 + 185), 'Unscripted Conversation Starters:', font=font_card_title, fill=(248, 250, 252))
    for j, p in enumerate(c['prompts']):
        py = card_y1 + 230 + j * 75
        draw14.rounded_rectangle([cx1 + 20, py, cx2 - 20, py + 60], radius=10, fill=(30, 41, 59), outline=(51, 65, 85), width=1)
        draw14.text((cx1 + 30, py + 18), p, font=font_body, fill=(226, 232, 240))
        
    # Bottom Action Button
    draw14.rounded_rectangle([cx1 + 20, card_y2 - 60, cx2 - 20, card_y2 - 15], radius=10, fill=c['color'])
    draw14.text((cx1 + (card_w // 2) - 65, card_y2 - 45), 'Initiate Bridge', font=font_card_title, fill=(255, 255, 255))

# Footer bar
draw14.rounded_rectangle([40, 710, W - 40, 810], radius=14, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
draw14.text((65, 730), 'Wearer Sovereignty Control: "Skip Small Talk Protocol" is currently LOCKED ON', font=font_card_title, fill=(52, 211, 153))
draw14.text((65, 765), 'Protects autistic cognitive energy by routing directly to shared passions without masking demands.', font=font_body, fill=(148, 163, 184))
draw14.rounded_rectangle([W - 240, 735, W - 65, 785], radius=10, fill=(51, 65, 85))
draw14.text((W - 215, 748), 'Preferences ⚙', font=font_card_title, fill=(255, 255, 255))

im14.save('gallery/14_social_wingman_matching.jpg', 'JPEG', quality=95)
print('Saved gallery/14_social_wingman_matching.jpg')


# ==========================================
# 15: Multimodal Unified Conversation Stream
# ==========================================
im15 = Image.new('RGB', (W, H), (11, 15, 25))
draw15 = ImageDraw.Draw(im15)

# Header
draw15.rounded_rectangle([40, 30, W - 40, 110], radius=16, fill=(18, 24, 38), outline=(139, 92, 246), width=1)
draw15.text((65, 45), 'NeuroBridge Multimodal Unified Timeline Architecture', font=font_title, fill=(248, 250, 252))
draw15.text((65, 83), '4 Modalities Streamed into One Real-Time Timeline with Dual-Engine Badging', font=font_subtitle, fill=(148, 163, 184))

timeline_x = 90
stream_items = [
    {
        'modality': 'MODALITY 1: SPOKEN AUDIO (Web Speech API)',
        'color': (59, 130, 246),
        'icon_text': 'MIC',
        'sender': 'Jordan (Peer)',
        'text': '"We need to get all our ducks in a row before the team sync tomorrow."',
        'engine': 'GEMINI 2.5 FLASH LLM',
        'clarification': 'Idiom detected: Means organizing materials and finalizing preparation thoroughly.'
    },
    {
        'modality': 'MODALITY 2: SINGLE-SWITCH SCANNING KEYBOARD',
        'color': (245, 158, 11),
        'icon_text': 'SW',
        'sender': 'Alex Rivera (Wearer)',
        'text': '"Slides 1-4 completed. Need quiet time to review dataset."',
        'engine': 'DOUBLE EMPATHY TRANSLATION',
        'clarification': 'Direct factual status: Explains to peer that Alex prefers independent focused review.'
    },
    {
        'modality': 'MODALITY 3: TYPED AAC QUICK-CHIP',
        'color': (16, 185, 129),
        'icon_text': 'AAC',
        'sender': 'Alex Rivera (Wearer)',
        'text': '"[Quick-Response AAC]: Can we continue via asynchronous chat?"',
        'engine': 'OFFLINE HEURISTIC ENGINE',
        'clarification': 'Sensory accommodation request: Lowers audio processing strain.'
    },
    {
        'modality': 'MODALITY 4: 3D MEDIAPIPE SOMATIC STIM GESTURE',
        'color': (236, 72, 153),
        'icon_text': 'STIM',
        'sender': 'Alex Rivera (Wearer)',
        'text': 'Kinematic Rapid Oscillation Detected: Hand Flapping (v = 0.24 norm/s > 0.18 threshold)',
        'engine': 'KINEMATIC JITTER BUFFER (~800ms)',
        'clarification': 'Stim Regulation Translation: "Alex is feeling happy and energized, not distressed."'
    }
]

# Draw central timeline guide
draw15.line([timeline_x, 140, timeline_x, 730], fill=(51, 65, 85), width=3)

for idx, item in enumerate(stream_items):
    iy = 135 + idx * 144
    
    # Node icon circle
    draw15.ellipse([timeline_x - 22, iy + 24, timeline_x + 22, iy + 68], fill=item['color'], outline=(255, 255, 255), width=2)
    draw15.text((timeline_x - 14, iy + 36), item['icon_text'], font=font_badge, fill=(255, 255, 255))
    
    # Card container
    draw15.rounded_rectangle([timeline_x + 45, iy, W - 50, iy + 130], radius=14, fill=(18, 24, 38), outline=item['color'], width=1)
    
    # Header of card
    draw15.text((timeline_x + 65, iy + 12), item['modality'], font=font_badge, fill=item['color'])
    draw15.text((timeline_x + 65, iy + 35), f"{item['sender']}: {item['text']}", font=font_card_title, fill=(241, 245, 249))
    
    # Engine badge & Clarification
    draw15.rounded_rectangle([timeline_x + 65, iy + 76, timeline_x + 315, iy + 114], radius=8, fill=(30, 41, 59))
    draw15.text((timeline_x + 80, iy + 88), f"⚡ {item['engine']}", font=font_badge, fill=(56, 189, 248))
    
    draw15.text((timeline_x + 335, iy + 88), f"Subtext Clarification: {item['clarification']}", font=font_body, fill=(203, 213, 225))

# Footer
draw15.rounded_rectangle([40, 750, W - 40, 820], radius=12, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
draw15.text((65, 768), 'Verified Real-Time Ingestion: 4 Inputs Unified into 1 Single Timeline with Zero Overlap', font=font_card_title, fill=(248, 250, 252))
draw15.text((65, 792), 'Tested with 18 automated suite checks in backend/test-suite.js', font=font_body, fill=(148, 163, 184))

im15.save('gallery/15_multimodal_timeline_unification.jpg', 'JPEG', quality=95)
print('Saved gallery/15_multimodal_timeline_unification.jpg')
