"""
Team Lifeline - Smart Ambulance Traffic Signal System
User Manual PDF Generator (Fixed - white background, proper page callbacks)
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image,
    Table, TableStyle, PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

# ── Color palette (for white background PDF) ──────────────────
C_GREEN      = HexColor('#059669')
C_GREEN_LIGHT= HexColor('#d1fae5')
C_BLUE       = HexColor('#1d4ed8')
C_BLUE_LIGHT = HexColor('#dbeafe')
C_RED        = HexColor('#dc2626')
C_RED_LIGHT  = HexColor('#fee2e2')
C_AMBER      = HexColor('#b45309')
C_AMBER_LIGHT= HexColor('#fef3c7')
C_PURPLE     = HexColor('#7c3aed')
C_PURPLE_LIGHT=HexColor('#ede9fe')
C_DARK       = HexColor('#1e293b')
C_DARK2      = HexColor('#334155')
C_MID        = HexColor('#475569')
C_MUTED      = HexColor('#94a3b8')
C_BORDER     = HexColor('#cbd5e1')
C_ROW1       = HexColor('#f8fafc')
C_ROW2       = HexColor('#f1f5f9')
C_HEADER_BG  = HexColor('#0f172a')

PAGE_W, PAGE_H = A4
ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
MARGIN = 15 * mm
AVAIL  = PAGE_W - 2 * MARGIN


def img(n):
    return os.path.join(ASSETS, f'{n}.png')


# ── Styles ────────────────────────────────────────────────────
def S(name, **kw):
    defaults = dict(fontName='Helvetica', fontSize=11,
                    textColor=C_DARK, leading=16)
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)


STYLES = {
    'cover_title': S('cover_title', fontName='Helvetica-Bold', fontSize=34,
                     textColor=C_GREEN, alignment=TA_CENTER, leading=42, spaceAfter=4),
    'cover_sub':   S('cover_sub',   fontName='Helvetica',      fontSize=15,
                     textColor=C_DARK2, alignment=TA_CENTER, leading=22, spaceAfter=4),
    'cover_tag':   S('cover_tag',   fontName='Helvetica',      fontSize=11,
                     textColor=C_MID,  alignment=TA_CENTER, leading=17),
    'chapter':     S('chapter',     fontName='Helvetica-Bold', fontSize=20,
                     textColor=C_GREEN, leading=26, spaceBefore=4, spaceAfter=8),
    'section':     S('section',     fontName='Helvetica-Bold', fontSize=14,
                     textColor=C_BLUE,  leading=20, spaceBefore=12, spaceAfter=5),
    'subsection':  S('subsection',  fontName='Helvetica-Bold', fontSize=12,
                     textColor=C_AMBER, leading=18, spaceBefore=8, spaceAfter=4),
    'body':        S('body',        fontName='Helvetica',      fontSize=10.5,
                     textColor=C_DARK, leading=16, spaceAfter=5, alignment=TA_JUSTIFY),
    'bullet':      S('bullet',      fontName='Helvetica',      fontSize=10.5,
                     textColor=C_DARK, leading=16, leftIndent=14, spaceAfter=3),
    'caption':     S('caption',     fontName='Helvetica-Oblique', fontSize=9,
                     textColor=C_MID, alignment=TA_CENTER, leading=13, spaceAfter=8),
    'note':        S('note',        fontName='Helvetica',      fontSize=10,
                     textColor=C_BLUE, leading=15),
    'warn':        S('warn',        fontName='Helvetica-Bold', fontSize=10,
                     textColor=C_AMBER, leading=15),
    'cell':        S('cell',        fontName='Helvetica',      fontSize=10,
                     textColor=C_DARK, leading=14),
    'cell_b':      S('cell_b',      fontName='Helvetica-Bold', fontSize=10,
                     textColor=C_DARK, leading=14),
    'cell_green':  S('cell_green',  fontName='Helvetica-Bold', fontSize=10,
                     textColor=C_GREEN, leading=14),
    'toc_main':    S('toc_main',    fontName='Helvetica-Bold', fontSize=12,
                     textColor=C_DARK, leading=22),
    'toc_sub':     S('toc_sub',     fontName='Helvetica',      fontSize=10,
                     textColor=C_MID,  leading=18, leftIndent=14),
    'footer':      S('footer',      fontName='Helvetica',      fontSize=8,
                     textColor=C_MUTED, alignment=TA_CENTER, leading=12),
    'step_num':    S('step_num',    fontName='Helvetica-Bold', fontSize=13,
                     textColor=C_GREEN, alignment=TA_CENTER, leading=16),
    'step_title':  S('step_title',  fontName='Helvetica-Bold', fontSize=10.5,
                     textColor=C_DARK, leading=15),
    'step_body':   S('step_body',   fontName='Helvetica',      fontSize=10,
                     textColor=C_MID, leading=14),
}


# ── Page header / footer callbacks ────────────────────────────
def _header_footer(canvas, doc):
    canvas.saveState()
    w, h = A4

    # Top green bar
    canvas.setFillColor(C_HEADER_BG)
    canvas.rect(0, h - 10*mm, w, 10*mm, fill=1, stroke=0)
    canvas.setFillColor(C_GREEN)
    canvas.rect(0, h - 10*mm, w, 2*mm, fill=1, stroke=0)

    canvas.setFillColor(white)
    canvas.setFont('Helvetica-Bold', 8.5)
    canvas.drawString(MARGIN, h - 6.5*mm, 'Team Lifeline  |  Smart Ambulance Traffic Signal System')
    canvas.setFont('Helvetica', 8.5)
    canvas.drawRightString(w - MARGIN, h - 6.5*mm, 'User Manual')

    # Bottom footer
    canvas.setFillColor(C_ROW2)
    canvas.rect(0, 0, w, 9*mm, fill=1, stroke=0)
    canvas.setStrokeColor(C_BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(0, 9*mm, w, 9*mm)

    canvas.setFillColor(C_MID)
    canvas.setFont('Helvetica', 7.5)
    canvas.drawString(MARGIN, 3.2*mm, 'SPR High School, Kamareddy  -  For Internal Use Only')
    canvas.drawRightString(w - MARGIN, 3.2*mm, f'Page {doc.page}')

    canvas.restoreState()


def _cover_page(canvas, doc):
    canvas.saveState()
    w, h = A4
    # Decorative top band
    canvas.setFillColor(C_GREEN)
    canvas.rect(0, h - 18*mm, w, 18*mm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont('Helvetica-Bold', 13)
    canvas.drawCentredString(w/2, h - 11*mm, 'TEAM LIFELINE  |  SMART AMBULANCE TRAFFIC SIGNAL SYSTEM')

    # Bottom band
    canvas.setFillColor(C_HEADER_BG)
    canvas.rect(0, 0, w, 18*mm, fill=1, stroke=0)
    canvas.setFillColor(C_MUTED)
    canvas.setFont('Helvetica', 8)
    canvas.drawCentredString(w/2, 7*mm, 'SPR High School, Kamareddy')
    canvas.drawCentredString(w/2, 3*mm, 'User Manual v1.0  -  September 2026')
    canvas.restoreState()


# ── Helpers ───────────────────────────────────────────────────
def hr(color=C_GREEN, thickness=1.0):
    return HRFlowable(width='100%', thickness=thickness, color=color,
                      spaceAfter=6, spaceBefore=2)


def screenshot(n, caption_text, width_pct=0.96):
    path = img(n)
    from PIL import Image as PIL_I
    with PIL_I.open(path) as pil:
        ow, oh = pil.size
    w = AVAIL * width_pct
    h = w * oh / ow
    im = Image(path, width=w, height=h)
    im.hAlign = 'CENTER'
    cap = Paragraph(f'Figure {n}: {caption_text}', STYLES['caption'])
    # thin border around screenshot
    border_data = [[im]]
    border_ts = TableStyle([
        ('BOX',           (0,0), (-1,-1), 1, C_BORDER),
        ('TOPPADDING',    (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING',   (0,0), (-1,-1), 3),
        ('RIGHTPADDING',  (0,0), (-1,-1), 3),
        ('BACKGROUND',    (0,0), (-1,-1), C_ROW1),
    ])
    bordered = Table(border_data, colWidths=[AVAIL * width_pct])
    bordered.setStyle(border_ts)
    bordered.hAlign = 'CENTER'
    return [Spacer(1, 6), bordered, cap]


def info_box(text, color=C_GREEN, bg=None, style='note'):
    if bg is None:
        bg = C_GREEN_LIGHT if color == C_GREEN else C_AMBER_LIGHT if color == C_AMBER else C_BLUE_LIGHT
    data = [[Paragraph(text, STYLES[style])]]
    ts = TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), bg),
        ('BOX',           (0,0), (-1,-1), 1.5, color),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
        ('RIGHTPADDING',  (0,0), (-1,-1), 10),
        ('TOPPADDING',    (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ])
    t = Table(data, colWidths=[AVAIL])
    t.setStyle(ts)
    return t


def make_table(header_row, data_rows, col_widths, header_color=C_GREEN):
    header_bg = C_HEADER_BG
    header_style = ParagraphStyle('th', fontName='Helvetica-Bold', fontSize=10,
                                  textColor=white, leading=14)
    rows = [[Paragraph(h, header_style) for h in header_row]]
    for row in data_rows:
        rows.append([Paragraph(str(c), STYLES['cell']) if isinstance(c, str) else c for c in row])

    ts = TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  header_bg),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [C_ROW1, C_ROW2]),
        ('FONTNAME',      (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE',      (0,0), (-1,-1), 10),
        ('TEXTCOLOR',     (0,0), (-1,-1), C_DARK),
        ('TOPPADDING',    (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING',   (0,0), (-1,-1), 7),
        ('RIGHTPADDING',  (0,0), (-1,-1), 7),
        ('LINEBELOW',     (0,0), (-1,-1), 0.4, C_BORDER),
        ('BOX',           (0,0), (-1,-1), 0.8, C_BORDER),
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
    ])
    t = Table(rows, colWidths=col_widths)
    t.setStyle(ts)
    return t


def steps_table(steps):
    rows = []
    for i, (title, desc) in enumerate(steps, 1):
        num  = Paragraph(str(i), STYLES['step_num'])
        body = [Paragraph(title, STYLES['step_title']),
                Paragraph(desc,  STYLES['step_body'])]
        rows.append([num, body])

    ts = TableStyle([
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [C_GREEN_LIGHT, C_ROW1]),
        ('VALIGN',         (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING',     (0,0), (-1,-1), 7),
        ('BOTTOMPADDING',  (0,0), (-1,-1), 7),
        ('LEFTPADDING',    (0,0), (-1,-1), 6),
        ('RIGHTPADDING',   (0,0), (-1,-1), 8),
        ('LINEBELOW',      (0,0), (-1,-1), 0.4, C_BORDER),
        ('BOX',            (0,0), (-1,-1), 0.8, C_BORDER),
        ('LINEAFTER',      (0,0), (0,-1),  0.4, C_BORDER),
    ])
    t = Table(rows, colWidths=[12*mm, AVAIL - 12*mm])
    t.setStyle(ts)
    return t


# ══════════════════════════════════════════════════════════════
#   BUILD PDF
# ══════════════════════════════════════════════════════════════
def build_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=16*mm, bottomMargin=14*mm,
        title='Team Lifeline - User Manual',
        author='Team Lifeline, SPR High School Kamareddy',
    )

    story = []

    # ──────────────────────────────────────────────────────────
    # COVER PAGE
    # ──────────────────────────────────────────────────────────
    story.append(Spacer(1, 32*mm))

    cover_icon = ParagraphStyle('ci', fontName='Helvetica-Bold', fontSize=80,
                                textColor=C_GREEN, alignment=TA_CENTER, leading=88)
    story.append(Paragraph('🚑', cover_icon))
    story.append(Spacer(1, 8*mm))
    story.append(Paragraph('Team Lifeline', STYLES['cover_title']))
    story.append(Paragraph('Smart Ambulance Traffic Signal System', STYLES['cover_sub']))
    story.append(Spacer(1, 5*mm))
    story.append(HRFlowable(width='50%', thickness=2, color=C_GREEN,
                            hAlign='CENTER', spaceAfter=8, spaceBefore=4))
    story.append(Paragraph('User Manual &amp; Operating Guide', ParagraphStyle(
        'cg', fontName='Helvetica-Bold', fontSize=16, textColor=C_BLUE,
        alignment=TA_CENTER, leading=22)))
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph('SPR High School, Kamareddy', STYLES['cover_tag']))
    story.append(Paragraph('Version 1.0  |  September 2026', STYLES['cover_tag']))
    story.append(Spacer(1, 14*mm))

    # badge row
    badge_labels = ['Web Application', 'Real-Time Tracking', 'Smart Signals', 'First-Aid AI']
    badge_colors = [C_GREEN, C_BLUE, C_PURPLE, C_AMBER]
    badge_style  = ParagraphStyle('bs', fontName='Helvetica-Bold', fontSize=10,
                                  textColor=white, alignment=TA_CENTER, leading=14)
    badge_cells  = [[Paragraph(b, badge_style) for b in badge_labels]]
    badge_ts = TableStyle(
        [('BACKGROUND',    (i,0), (i,0), badge_colors[i]) for i in range(4)] +
        [('TOPPADDING',    (0,0), (-1,-1), 6),
         ('BOTTOMPADDING', (0,0), (-1,-1), 6),
         ('LEFTPADDING',   (0,0), (-1,-1), 4),
         ('RIGHTPADDING',  (0,0), (-1,-1), 4),
         ('ALIGN',         (0,0), (-1,-1), 'CENTER'),
         ('VALIGN',        (0,0), (-1,-1), 'MIDDLE')]
    )
    cw = AVAIL / 4
    bt = Table(badge_cells, colWidths=[cw]*4)
    bt.setStyle(badge_ts)
    story.append(bt)

    story.append(PageBreak())

    # ──────────────────────────────────────────────────────────
    # TABLE OF CONTENTS
    # ──────────────────────────────────────────────────────────
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('Table of Contents', ParagraphStyle(
        'toc_h', fontName='Helvetica-Bold', fontSize=20,
        textColor=C_GREEN, leading=26, spaceAfter=8)))
    story.append(hr())

    toc = [
        ('1', 'System Overview',
         ['What is Team Lifeline?', 'How It Works', 'Pages at a Glance']),
        ('2', 'Getting Started',
         ['Requirements & Browser Support', 'Opening the Website']),
        ('3', 'Emergency Caller — Landing Page (index.html)',
         ['Describing the Emergency', 'Voice Input', 'Sharing Your Location', 'Calling for Emergency']),
        ('4', 'Victim / Caller Dashboard (victim.html)',
         ['Ambulance Status', 'Live Map', 'Adding Location Details', 'First-Aid AI', 'Call & Arrival']),
        ('5', 'Ambulance Driver Dashboard (ambulance.html)',
         ['Incident Panel', 'Route Selection', 'Starting Journey', 'Live HUD',
          'Smart Signal Clearance', 'Hospital Selection', 'Patient Transfer', 'Call Modal']),
        ('6', 'First-Aid AI Quick Reference', []),
        ('7', 'Frequently Asked Questions', []),
        ('8', 'Troubleshooting', []),
    ]

    for num, title, subs in toc:
        story.append(Paragraph(
            f'<font color="#059669"><b>{num}.</b></font>  <b>{title}</b>',
            STYLES['toc_main']))
        for sub in subs:
            story.append(Paragraph(f'   ▸  {sub}', STYLES['toc_sub']))
        story.append(Spacer(1, 2))

    story.append(PageBreak())

    # ──────────────────────────────────────────────────────────
    # CH 1: SYSTEM OVERVIEW
    # ──────────────────────────────────────────────────────────
    story.append(Paragraph('1.  System Overview', STYLES['chapter']))
    story.append(hr())

    story.append(Paragraph('1.1  What is Team Lifeline?', STYLES['section']))
    story.append(Paragraph(
        'Team Lifeline is a web-based Smart Ambulance Traffic Signal System developed by students '
        'of SPR High School, Kamareddy. The system dramatically reduces emergency response time '
        'by creating a real-time digital link between accident victims, ambulance drivers, and '
        'traffic signals along the route.',
        STYLES['body']))
    story.append(Paragraph(
        'When a person reports an accident, the system automatically dispatches the nearest '
        'ambulance, computes the best route using OpenStreetMap, and turns every signal along '
        'that route <b><font color="#059669">GREEN</font></b> as the ambulance approaches — '
        'ensuring zero delays at intersections.',
        STYLES['body']))
    story.append(Spacer(1, 6))

    story.append(Paragraph('Key Features', STYLES['subsection']))
    feat = make_table(
        ['Feature', 'Description'],
        [
            ['Voice Emergency Report',    'Caller speaks the emergency; speech-to-text captures it instantly.'],
            ['GPS Location Sharing',      'Browser Geolocation API pinpoints exact accident coordinates.'],
            ['Real-Time Map Tracking',    'Victim and driver both see the ambulance moving live on a map.'],
            ['Smart Signal Clearance',    'Signals within 280 m of ambulance turn green; revert to red after it passes.'],
            ['First-Aid AI Assistant',    'Chatbot gives immediate guidance for bleeding, fractures, CPR, and crashes.'],
            ['Hospital Recommendation',   'Lists nearby hospitals with ICU beds and OT availability.'],
            ['In-App Voice Call',         'Driver and victim can open a simulated audio call directly in the browser.'],
        ],
        [AVAIL*0.30, AVAIL*0.70]
    )
    story.append(feat)
    story.append(Spacer(1, 8))

    story.append(Paragraph('1.2  How It Works', STYLES['section']))
    story.append(steps_table([
        ('Report Emergency',
         'Caller opens index.html, speaks or types the incident, shares GPS location, presses CALL FOR EMERGENCY.'),
        ('Victim Dashboard Opens',
         'victim.html loads automatically — shows map with ambulance position, AI chatbot, live ETA.'),
        ('Driver Dashboard Opens',
         'Ambulance driver opens ambulance.html — sees incident details, picks best route, presses Go.'),
        ('Smart Corridor Activates',
         'As ambulance moves, signals ahead turn green (< 280 m) and revert to red after it passes (> 350 m).'),
        ('Arrival & Hospital Transfer',
         'Driver arrives at scene, selects nearest hospital, picks route, transfers patient — mission complete.'),
    ]))
    story.append(Spacer(1, 8))

    story.append(Paragraph('1.3  Pages at a Glance', STYLES['section']))
    story.append(make_table(
        ['Page File', 'Used By', 'Purpose'],
        [
            ['index.html',     'Caller / Bystander',       'Report the emergency, share location'],
            ['victim.html',    'Victim / Caller',           'Track ambulance, get first-aid help'],
            ['ambulance.html', 'Ambulance Driver',          'Navigate to scene, manage signals, transfer patient'],
            ['emergency.html', 'Control Room (Demo)',       'Split-screen combined view of both dashboards'],
            ['patient.html',   'Alternative Victim View',   'Alternate real-time victim portal'],
        ],
        [AVAIL*0.25, AVAIL*0.25, AVAIL*0.50]
    ))

    story.append(PageBreak())

    # ──────────────────────────────────────────────────────────
    # CH 2: GETTING STARTED
    # ──────────────────────────────────────────────────────────
    story.append(Paragraph('2.  Getting Started', STYLES['chapter']))
    story.append(hr())

    story.append(Paragraph('2.1  Requirements & Browser Support', STYLES['section']))
    story.append(make_table(
        ['Requirement', 'Details'],
        [
            ['Browser',            'Google Chrome 90+ or Microsoft Edge 90+ (recommended). Firefox and Safari lack full voice API support.'],
            ['Internet Connection','Required for map tiles (OpenStreetMap) and route calculation (OSRM API).'],
            ['Microphone',         'Optional — needed only for voice description. Typing is always available as alternative.'],
            ['Location Permission','Optional — browser will ask. Falls back to Kamareddy demo coordinates if denied.'],
            ['Screen Size',        'Best on 1280x720 or larger. Desktop recommended for the driver dashboard layout.'],
        ],
        [AVAIL*0.26, AVAIL*0.74]
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph('2.2  Opening the Website', STYLES['section']))
    story.append(steps_table([
        ('Download / Extract', 'Ensure the project folder has index.html, ambulance.html, victim.html, css/, js/ folders.'),
        ('Open Landing Page',  'Double-click index.html or drag it into Chrome. Team Lifeline landing page opens immediately.'),
        ('No Server Needed',   'All features work via external CDN links — just an internet connection is required.'),
        ('Open Driver Tab',    'Open ambulance.html in a separate browser tab/window. Both pages communicate via BroadcastChannel.'),
    ]))
    story.append(Spacer(1, 6))
    story.append(info_box(
        'TIP: For best demo experience, open index.html in one window and ambulance.html side-by-side '
        'in another. Submit an emergency on the first window and watch the driver dashboard respond automatically.',
        color=C_GREEN, style='note'))

    story.append(PageBreak())

    # ──────────────────────────────────────────────────────────
    # CH 3: LANDING PAGE
    # ──────────────────────────────────────────────────────────
    story.append(Paragraph('3.  Emergency Caller — Landing Page', STYLES['chapter']))
    story.append(hr())
    story.append(info_box('File: index.html  |  Used by: Caller / Bystander at the accident scene',
                          color=C_BLUE, bg=C_BLUE_LIGHT, style='note'))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'The landing page is the entry point of Team Lifeline. Any person witnessing an accident '
        'opens this page and follows two simple steps to dispatch an ambulance.',
        STYLES['body']))

    for fl in screenshot(1, 'Landing page — initial state. Form empty, CALL FOR EMERGENCY button disabled (grey).'):
        story.append(fl)

    story.append(Paragraph('3.1  Step 1 — Describing the Emergency', STYLES['section']))
    story.append(Paragraph('There are two ways to enter the emergency description:', STYLES['body']))

    story.append(Paragraph('Option A — Voice Input (Microphone)', STYLES['subsection']))
    story.append(steps_table([
        ('Click "Hold to Speak"',  'The red microphone button activates the browser Speech Recognition API. Button pulses red while listening.'),
        ('Speak Clearly',           'Describe what happened — location, accident type, number of victims, injuries visible.'),
        ('Speech Transcribed',      'Words appear in the transcript box in real time and are copied to the description field automatically.'),
        ('Stop Recording',          'Click button again or pause — recording stops automatically. You can then edit the text in the textarea.'),
    ]))
    story.append(Spacer(1, 5))
    story.append(info_box(
        'WARNING: Voice input requires microphone permission. If your browser blocks it, a message appears '
        'and you can type instead. Chrome is required for full voice support.',
        color=C_AMBER, bg=C_AMBER_LIGHT, style='warn'))

    story.append(Paragraph('Option B — Type the Description', STYLES['subsection']))
    story.append(Paragraph(
        'Click the textarea and type directly. Example: "Accident on NH-44 bypass near Indian Oil pump. '
        '2 people injured, one is bleeding heavily." The CALL FOR EMERGENCY button activates only after '
        'at least 4 characters are entered AND a location is captured.',
        STYLES['body']))

    story.append(Paragraph('3.2  Step 2 — Sharing Your Location', STYLES['section']))
    story.append(steps_table([
        ('Click "Use My Location"', 'The browser requests GPS permission. Click Allow.'),
        ('Location Captured',       'Coordinates appear in green: e.g. "Captured: 18.32512 N, 78.33198 E".'),
        ('Fallback Mode',           'If GPS is denied, the system uses Kamareddy NH-44 Bypass demo coordinates automatically.'),
    ]))

    story.append(Paragraph('3.3  Calling for Emergency', STYLES['section']))
    story.append(Paragraph(
        'Once description (> 3 chars) and location are both ready, the '
        '<b>CALL FOR EMERGENCY</b> button turns green and becomes clickable.',
        STYLES['body']))

    for fl in screenshot(2, 'Landing page — filled form, location captured, green CALL FOR EMERGENCY button now active.'):
        story.append(fl)

    story.append(Paragraph(
        'Clicking the button saves the emergency data (description, coordinates, timestamp) to '
        'browser localStorage and navigates automatically to victim.html.',
        STYLES['body']))

    story.append(PageBreak())

    # ──────────────────────────────────────────────────────────
    # CH 4: VICTIM DASHBOARD
    # ──────────────────────────────────────────────────────────
    story.append(Paragraph('4.  Victim / Caller Dashboard', STYLES['chapter']))
    story.append(hr())
    story.append(info_box('File: victim.html  |  Used by: Victim or Caller waiting at the scene',
                          color=C_BLUE, bg=C_BLUE_LIGHT, style='note'))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'After calling for emergency, the browser navigates automatically to victim.html. '
        'This page keeps the victim informed about the ambulance progress and provides '
        'first-aid guidance while help is on the way.',
        STYLES['body']))

    story.append(Paragraph('4.1  Ambulance Status Card', STYLES['section']))
    story.append(Paragraph(
        'The left sidebar shows a green "Ambulance Status" card with real-time updates. '
        'It starts in a "dispatched" waiting state, then switches to an "En Route" state '
        'showing Vehicle ID (AMB-LIFELINE-01), driver (Officer R. Sharma), live ETA countdown, '
        'distance remaining, and corridor status.',
        STYLES['body']))

    for fl in screenshot(3, 'Victim dashboard — ambulance dispatched state. Map shows victim pin and ambulance. First-Aid AI chatbot ready.'):
        story.append(fl)

    story.append(Paragraph('4.2  Live Map Tracking', STYLES['section']))
    story.append(Paragraph('The right panel shows an interactive OpenStreetMap with two markers:', STYLES['body']))
    story.append(Paragraph('  •  Red pin (📍) — your location (accident scene)', STYLES['bullet']))
    story.append(Paragraph('  •  Green ambulance (🚑) — ambulance position, updating in real time as the driver moves', STYLES['bullet']))
    story.append(Paragraph(
        'The top HUD overlay shows ETA, distance, and corridor status live. '
        'The map auto-fits to show both the victim and ambulance markers.',
        STYLES['body']))

    story.append(Paragraph('4.3  Adding Extra Location Details', STYLES['section']))
    story.append(steps_table([
        ('Find the Input Field', 'Under "Your Location" there is a text box: "Add landmark e.g. near blue ATM..."'),
        ('Type a Landmark',      'Enter any recognisable landmark — a shop name, building colour, pole number, etc.'),
        ('Press Send',           'The detail is instantly broadcast to the ambulance driver. A green check "Sent to driver" confirms delivery.'),
    ]))

    story.append(Paragraph('4.4  First-Aid AI Assistant', STYLES['section']))
    story.append(Paragraph(
        'The chatbot at the bottom of the sidebar gives immediate first-aid guidance. '
        'Tap any quick button or type a question and press Ask:',
        STYLES['body']))
    story.append(make_table(
        ['Button', 'First-Aid Guidance Summary'],
        [
            ['Bleeding',     'Press cloth firmly, do not lift, raise limb, keep patient warm and still'],
            ['Unconscious',  'Check breathing, recovery position or CPR (30+2), never give water'],
            ['Fracture',     'Do not move limb, support with clothing, cover open wounds'],
            ['Crash',        'Warn vehicles, switch off ignition, do not move victims, reassure them'],
        ],
        [AVAIL*0.20, AVAIL*0.80]
    ))

    story.append(Paragraph('4.5  Calling the Ambulance Team & Arrival', STYLES['section']))
    story.append(Paragraph(
        'Press the red "Talk with Ambulance Team" button to open a call modal. After 2 seconds, '
        'the driver message appears and is read aloud via text-to-speech. '
        'When the ambulance arrives, a full-screen "Ambulance Has Arrived!" overlay appears.',
        STYLES['body']))

    story.append(PageBreak())

    # ──────────────────────────────────────────────────────────
    # CH 5: AMBULANCE DRIVER DASHBOARD
    # ──────────────────────────────────────────────────────────
    story.append(Paragraph('5.  Ambulance Driver Dashboard', STYLES['chapter']))
    story.append(hr())
    story.append(info_box('File: ambulance.html  |  Used by: Ambulance Driver',
                          color=C_RED, bg=C_RED_LIGHT, style='note'))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        'This is the primary operational dashboard for the ambulance driver. It displays the '
        'emergency details, provides route options, tracks the journey live with smart signal '
        'clearance, and guides the patient transfer to hospital.',
        STYLES['body']))

    story.append(Paragraph('5.1  Emergency Incident Panel', STYLES['section']))
    story.append(Paragraph(
        'The red-bordered card at the top of the sidebar shows the emergency description from '
        'the caller, caller name and phone number, any extra details sent by the victim (blue info box), '
        'and a "Call Victim / Caller" button.',
        STYLES['body']))

    story.append(Paragraph('5.2  Route Selection to Scene', STYLES['section']))
    story.append(Paragraph(
        'The system loads two routes from ambulance base to accident scene using the OSRM open-source routing engine:',
        STYLES['body']))
    story.append(make_table(
        ['Route', 'Name', 'Map Display', 'Metrics'],
        [
            ['Route 1', 'NH-44 Highway (BEST)',         'Green solid line',  'Time, Distance, Signals: 3-4, Vehicles: 28'],
            ['Route 2', 'Town Arterial (ALTERNATIVE)',  'Amber dashed line', 'Time, Distance, Signals: 4-5, Vehicles: 64'],
        ],
        [AVAIL*0.12, AVAIL*0.28, AVAIL*0.26, AVAIL*0.34]
    ))
    story.append(Spacer(1, 6))

    for fl in screenshot(4, 'Driver Dashboard — Route 1 (NH-44, BEST) selected in green. Traffic signal icons visible on map.'):
        story.append(fl)

    for fl in screenshot(5, 'Route 2 (Town Arterial) selected — amber dashed line on map, 4 signal icons repositioned.'):
        story.append(fl)

    story.append(Paragraph('5.3  Starting the Journey', STYLES['section']))
    story.append(steps_table([
        ('Select Route',        'Click the preferred route card. Route 1 (NH-44) is pre-selected as BEST.'),
        ('Press "Go — Start Journey"', 'Button shows "Journey in Progress". Ambulance icon starts moving on the map.'),
        ('Victim Notified',     'victim.html automatically shows "Ambulance En Route" with a green badge.'),
        ('Voice Announcement',  '"Emergency ambulance departing. Smart signal corridor activated." is spoken aloud.'),
    ]))
    story.append(Spacer(1, 6))

    for fl in screenshot(6, 'Journey in progress — speed 32 km/h, ETA 1.4 min, Market Junction signal GREEN (40 m ahead). Live HUD updating.'):
        story.append(fl)

    story.append(Paragraph('5.4  Smart Traffic Signal Clearance', STYLES['section']))
    story.append(make_table(
        ['Event', 'Distance', 'Action'],
        [
            ['Ambulance approaches signal', '< 280 m', 'Signal turns GREEN — voice announces junction name'],
            ['Ambulance passes signal',     '> 350 m', 'Signal reverts to RED — normal traffic cycle resumes'],
        ],
        [AVAIL*0.38, AVAIL*0.18, AVAIL*0.44]
    ))
    story.append(Spacer(1, 6))
    story.append(info_box(
        'Signal icons on the map change colour in real time — glowing green when cleared, red when restored. '
        'Click a signal icon to see its name and current state in a popup.',
        color=C_GREEN, style='note'))

    story.append(Paragraph('5.5  Hospital Selection', STYLES['section']))
    story.append(Paragraph(
        'When the ambulance arrives at the scene, the Route card hides and a "Select Hospital for Transfer" '
        'card appears. Two hospitals are listed:',
        STYLES['body']))
    story.append(make_table(
        ['Hospital', 'ICU Beds', 'Trauma OT', 'Tag'],
        [
            ['Government Area Hospital, Kamareddy', '6 Free', 'READY', 'RECOMMENDED'],
            ['Lifeline Superspeciality Hospital',   '12 Free', 'READY', '—'],
        ],
        [AVAIL*0.46, AVAIL*0.16, AVAIL*0.16, AVAIL*0.22]
    ))
    story.append(Spacer(1, 6))

    for fl in screenshot(8, 'Route to Hospital — Government Area Hospital selected, Route 1 Direct (1.2 min, 0.6 km). Purple "Go — Transfer Patient" button.'):
        story.append(fl)

    story.append(Paragraph('5.6  Route to Hospital & Patient Transfer', STYLES['section']))
    story.append(Paragraph(
        'Two hospital routes are offered — Direct and Via Town. Select the best option '
        'and press "Go — Transfer Patient". The ambulance drives to the hospital with '
        'full smart signal clearance. Voice announces: "Ambulance departing to [Hospital]. '
        'Smart corridor engaged."',
        STYLES['body']))

    for fl in screenshot(9, 'En Route to Government Area Hospital — speed 39 km/h, ETA 0.5 min, Market Junction GREEN (88 m ahead).'):
        story.append(fl)

    story.append(Paragraph(
        'When the ambulance reaches the hospital, the sidebar shows: "Patient Delivered!" '
        'with the hospital name and a "New Emergency" link.',
        STYLES['body']))

    story.append(Paragraph('5.7  Call Modal (Driver Side)', STYLES['section']))

    for fl in screenshot(7, 'Driver call modal — simulated conversation: caller describes patient condition, driver confirms ETA and signal clearance.'):
        story.append(fl)

    story.append(Paragraph(
        'Pressing "Call Victim / Caller" opens a modal showing the caller name and phone. '
        'After 2 seconds, a simulated conversation appears. This message is also broadcast to '
        'the victim dashboard. Press the X button to close.',
        STYLES['body']))

    story.append(PageBreak())

    # ──────────────────────────────────────────────────────────
    # VICTIM DASHBOARD SCREENSHOTS (continuation)
    # ──────────────────────────────────────────────────────────
    story.append(Paragraph('5.8  Victim Dashboard — Live Updates', STYLES['section']))
    story.append(Paragraph(
        'As the driver operates the ambulance dashboard, the victim dashboard updates automatically. '
        'No manual refresh is needed — updates are pushed via BroadcastChannel.',
        STYLES['body']))

    for fl in screenshot(10, 'Victim dashboard — Ambulance En Route, ETA 1.3 min, distance 0.6 km. Smart corridor active. First-Aid AI chatbot ready.'):
        story.append(fl)

    for fl in screenshot(11, 'Victim dashboard — call modal showing driver message: "full signal clearance, under 2 minutes away, stay calm."'):
        story.append(fl)

    for fl in screenshot(12, 'Victim dashboard — Ambulance Arrived, ETA 0.0 min, distance 0.0 km. First-Aid AI showing broken bone guidance.'):
        story.append(fl)

    story.append(PageBreak())

    # ──────────────────────────────────────────────────────────
    # CH 6: FIRST-AID AI REFERENCE
    # ──────────────────────────────────────────────────────────
    story.append(Paragraph('6.  First-Aid AI Quick Reference', STYLES['chapter']))
    story.append(hr())
    story.append(Paragraph(
        'The following guidance is built into the AI assistant. Tap the quick buttons '
        'or type keywords (bleed, fracture, cpr, crash, fire, unconscious) to get help.',
        STYLES['body']))
    story.append(Spacer(1, 8))

    def first_aid_card(title, color, bg, steps_list):
        title_p = Paragraph(title, ParagraphStyle('fat', fontName='Helvetica-Bold',
                                                   fontSize=12, textColor=color, leading=18))
        rows = [[title_p]]
        for s in steps_list:
            rows.append([Paragraph(s, STYLES['cell'])])
        ts = TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg),
            ('BACKGROUND', (0,0), (-1,0),  color),
            ('TEXTCOLOR',  (0,0), (-1,0),  white),
            ('BOX',        (0,0), (-1,-1), 1.5, color),
            ('LINEBELOW',  (0,0), (-1,-1), 0.4, C_BORDER),
            ('TOPPADDING',    (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING',   (0,0), (-1,-1), 10),
            ('RIGHTPADDING',  (0,0), (-1,-1), 10),
        ])
        t = Table(rows, colWidths=[AVAIL])
        t.setStyle(ts)
        return t

    story.append(first_aid_card('Severe Bleeding', C_RED, C_RED_LIGHT, [
        '1. Press a clean cloth FIRMLY over the wound — do not lift to check.',
        '2. If cloth soaks through, add more cloth on top — do not remove the first.',
        '3. Raise the injured limb above heart level (only if no fracture suspected).',
        '4. Keep the patient lying down and warm.',
        '5. Talk calmly — reassure them help is minutes away.',
    ]))
    story.append(Spacer(1, 8))

    story.append(first_aid_card('Unconscious Person', C_BLUE, C_BLUE_LIGHT, [
        '1. Check for breathing — watch for chest rise for 5 seconds.',
        '2. If breathing: Roll into recovery position (on their side).',
        '3. If NOT breathing: Start CPR — 30 chest compressions, then 2 rescue breaths.',
        '4. Continue CPR until the ambulance arrives.',
        '5. NEVER give water or food to an unconscious person.',
    ]))
    story.append(Spacer(1, 8))

    story.append(first_aid_card('Broken Bone / Fracture', C_AMBER, C_AMBER_LIGHT, [
        '1. Do NOT try to move or straighten the injured limb.',
        '2. Support the limb gently with rolled clothing, a jacket, or padding.',
        '3. If the bone has broken through the skin, cover with a clean cloth.',
        '4. Immobilise the area above and below the injury.',
        '5. Keep the patient still and calm until help arrives.',
    ]))
    story.append(Spacer(1, 8))

    story.append(first_aid_card('Car Crash / Fire / Smoke', C_GREEN, C_GREEN_LIGHT, [
        '1. Warn approaching vehicles — use hazard lights, place objects on the road.',
        '2. Switch off the vehicle ignition if safely reachable.',
        '3. Do NOT move accident victims unless the vehicle is on fire.',
        '4. If fire or smoke: Move victims only if absolutely necessary, cover nose and mouth.',
        '5. Reassure victims: "Help is on the way."',
    ]))

    story.append(PageBreak())

    # ──────────────────────────────────────────────────────────
    # CH 7: FAQ
    # ──────────────────────────────────────────────────────────
    story.append(Paragraph('7.  Frequently Asked Questions', STYLES['chapter']))
    story.append(hr())
    story.append(Spacer(1, 4))

    faqs = [
        ('Does this work on mobile phones?',
         'Yes, all pages are mobile-responsive. However, the ambulance driver dashboard works best on a laptop or tablet due to the side-by-side map layout.'),
        ('Do I need to install any software?',
         'No. This is a pure web application. Just open the HTML files in Chrome. No Node.js, server, or installation required.'),
        ('What happens if the internet goes down?',
         'Map tiles and route calculation require internet. If offline, the map shows blank tiles and routing falls back to a straight line between points.'),
        ('Can two people use it on different devices simultaneously?',
         'The victim and driver dashboards work across tabs/windows in the SAME browser via BroadcastChannel. True multi-device sync requires a backend server (not in this version).'),
        ('Why does the microphone button not work?',
         'Use Google Chrome. Allow microphone permission when the browser asks. Voice is not available in Firefox or Safari — type the description instead.'),
        ('Why does the location show Kamareddy even when I am elsewhere?',
         'This is fallback demo mode. When GPS is denied or unavailable, the system uses Kamareddy NH-44 coordinates (18.3312 N, 78.3445 E) to keep the demo functional.'),
        ('What does "Smart corridor active" mean?',
         'It means signals are automatically turning green as the ambulance approaches (within 280 m) and reverting to red after it passes (beyond 350 m) — creating a continuous green corridor.'),
        ('How many hospitals can be selected?',
         'The current version supports two hospitals. The system marks the first (Government Area Hospital) as RECOMMENDED based on proximity and ICU availability.'),
    ]

    for q, a in faqs:
        story.append(Paragraph(f'Q: {q}', STYLES['subsection']))
        story.append(Paragraph(f'A: {a}', STYLES['body']))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ──────────────────────────────────────────────────────────
    # CH 8: TROUBLESHOOTING
    # ──────────────────────────────────────────────────────────
    story.append(Paragraph('8.  Troubleshooting', STYLES['chapter']))
    story.append(hr())
    story.append(Spacer(1, 4))

    troubles = [
        ('Map is blank / not loading',
         'Check internet connection. OpenStreetMap tiles require internet. Hard-refresh the page (Ctrl+Shift+R).'),
        ('Routes not appearing on map',
         'OSRM routing API may be temporarily unavailable. Wait a few seconds and refresh. The system falls back to a straight-line path automatically.'),
        ('"CALL FOR EMERGENCY" button stays grey',
         'Both the description (> 3 characters) AND location must be filled. Click "Use My Location" and enter a description first.'),
        ('Victim dashboard shows no ambulance movement',
         'Ensure ambulance.html is open in another tab/window in the SAME browser. BroadcastChannel only works within the same browser session.'),
        ('Voice input not transcribing',
         'Use Google Chrome. Allow microphone permission. Speak clearly and not too fast. Type the description in the textarea as an alternative.'),
        ('Text-to-speech not working',
         'Check that the browser tab is not muted. Some browsers require a user interaction before allowing speech synthesis.'),
        ('Hospital routes show "Loading routes..."',
         'OSRM is still fetching routes in the background. Wait 2-3 seconds and click the hospital button again.'),
        ('Page layout looks broken on screen',
         'Zoom your browser to 100% (Ctrl+0). The dashboard is optimised for 100% zoom on 1280x720 or larger screens.'),
    ]

    trbl_rows = [[Paragraph(f'Issue: {issue}', STYLES['warn']),
                  Paragraph(f'Solution: {sol}',  STYLES['cell'])]
                 for issue, sol in troubles]

    trbl_ts = TableStyle([
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [C_AMBER_LIGHT, C_ROW1]),
        ('VALIGN',         (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING',     (0,0), (-1,-1), 7),
        ('BOTTOMPADDING',  (0,0), (-1,-1), 7),
        ('LEFTPADDING',    (0,0), (-1,-1), 8),
        ('RIGHTPADDING',   (0,0), (-1,-1), 8),
        ('LINEBELOW',      (0,0), (-1,-1), 0.4, C_BORDER),
        ('BOX',            (0,0), (-1,-1), 0.8, C_BORDER),
        ('LINEAFTER',      (0,0), (0,-1),  0.4, C_BORDER),
    ])
    trbl_t = Table(trbl_rows, colWidths=[AVAIL*0.38, AVAIL*0.62])
    trbl_t.setStyle(trbl_ts)
    story.append(trbl_t)

    story.append(PageBreak())

    # ──────────────────────────────────────────────────────────
    # DEMO NOTICE PAGE
    # ──────────────────────────────────────────────────────────
    story.append(Spacer(1, 6*mm))

    # Big notice banner
    notice_title_style = ParagraphStyle('nt', fontName='Helvetica-Bold', fontSize=22,
                                        textColor=white, alignment=TA_CENTER, leading=28)
    notice_sub_style   = ParagraphStyle('ns', fontName='Helvetica',      fontSize=12,
                                        textColor=C_AMBER_LIGHT, alignment=TA_CENTER, leading=18)
    notice_data = [
        [Paragraph('DEMO VERSION', notice_title_style)],
        [Paragraph('This is a Prototype — Full Version Coming Soon!', notice_sub_style)],
    ]
    notice_ts = TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), C_AMBER),
        ('TOPPADDING',    (0,0), (-1,-1), 14),
        ('BOTTOMPADDING', (0,0), (-1,-1), 14),
        ('LEFTPADDING',   (0,0), (-1,-1), 16),
        ('RIGHTPADDING',  (0,0), (-1,-1), 16),
        ('BOX',           (0,0), (-1,-1), 2, HexColor('#92400e')),
    ])
    notice_t = Table(notice_data, colWidths=[AVAIL])
    notice_t.setStyle(notice_ts)
    story.append(notice_t)
    story.append(Spacer(1, 10))

    story.append(Paragraph('Important Notice', ParagraphStyle(
        'inn', fontName='Helvetica-Bold', fontSize=18, textColor=C_RED, leading=24, spaceAfter=6)))
    story.append(hr(color=C_RED, thickness=1.2))
    story.append(Spacer(1, 4))

    disclaimer_style = ParagraphStyle('disc', fontName='Helvetica', fontSize=11,
                                      textColor=C_DARK, leading=18, spaceAfter=8, alignment=TA_JUSTIFY)
    story.append(Paragraph(
        'This website is a <b>demonstration prototype</b> built for the school science exhibition '
        'by Team Lifeline, SPR High School, Kamareddy. It showcases the concept and core technology '
        'of the Smart Ambulance Traffic Signal System.',
        disclaimer_style))
    story.append(Paragraph(
        'The current version uses <b>simulated data</b> — ambulance movement, signal clearance, '
        'hospital availability, and call conversations are all simulations running in the browser. '
        'No real ambulances, traffic controllers, or government systems are connected at this stage.',
        disclaimer_style))

    # What is simulated table
    story.append(Paragraph('What Is Simulated in This Demo', STYLES['section']))
    story.append(make_table(
        ['Feature', 'Demo Behaviour', 'Real Version Will Have'],
        [
            ['Ambulance Movement',
             'Animated along a computed route at fixed speed intervals',
             'Live GPS data from actual ambulance vehicle'],
            ['Traffic Signal Clearance',
             'Signal icons in browser change colour based on proximity threshold',
             'Physical signal controllers receive real commands via IoT/4G'],
            ['Hospital Availability',
             'Static hardcoded ICU bed count and OT status',
             'Live hospital management system API integration'],
            ['Audio Call',
             'Simulated conversation text displayed after 2-second delay',
             'Real WebRTC voice call between driver and victim devices'],
            ['Caller & Driver Data',
             'Demo names: Suresh Reddy, Officer R. Sharma',
             'Authenticated dispatch system with real personnel data'],
            ['Route Calculation',
             'Real road routes via OSRM open-source API (accurate)',
             'Same OSRM or Google Maps API — already real in this demo!'],
        ],
        [AVAIL*0.25, AVAIL*0.37, AVAIL*0.38]
    ))
    story.append(Spacer(1, 10))

    # How the project works section
    story.append(Paragraph('How Our Project Works — Concept Explained', STYLES['chapter']))
    story.append(hr(color=C_BLUE))
    story.append(Spacer(1, 4))

    story.append(Paragraph(
        'The Team Lifeline system is designed around one core idea: '
        '<b>every second saved in ambulance response time can save a life.</b> '
        'Traffic signals are the biggest source of delay for emergency vehicles in towns like Kamareddy. '
        'Our system solves this digitally.',
        disclaimer_style))

    story.append(Paragraph('The Three-Layer Architecture', STYLES['section']))
    arch_rows = [
        [
            Paragraph('Layer 1\nCaller / Victim App', ParagraphStyle('al', fontName='Helvetica-Bold',
                       fontSize=11, textColor=white, alignment=TA_CENTER, leading=16)),
            Paragraph('Layer 2\nAmbulance Driver App', ParagraphStyle('al', fontName='Helvetica-Bold',
                       fontSize=11, textColor=white, alignment=TA_CENTER, leading=16)),
            Paragraph('Layer 3\nSmart Signal Control', ParagraphStyle('al', fontName='Helvetica-Bold',
                       fontSize=11, textColor=white, alignment=TA_CENTER, leading=16)),
        ],
        [
            Paragraph(
                'Person at accident scene opens the web app, speaks or types the emergency, '
                'and shares GPS location. The system records all details and dispatches the ambulance.',
                STYLES['cell']),
            Paragraph(
                'Ambulance driver receives the alert, sees the optimised route on a live map, '
                'and begins navigation. A smart green corridor is activated ahead.',
                STYLES['cell']),
            Paragraph(
                'As the ambulance approaches each junction, the traffic signal receives a command '
                'to turn green. After the ambulance passes, the signal automatically resets to red '
                'for normal traffic.',
                STYLES['cell']),
        ],
    ]
    arch_ts = TableStyle([
        ('BACKGROUND',    (0,0), (0,0), C_GREEN),
        ('BACKGROUND',    (1,0), (1,0), C_BLUE),
        ('BACKGROUND',    (2,0), (2,0), C_PURPLE),
        ('BACKGROUND',    (0,1), (0,1), C_GREEN_LIGHT),
        ('BACKGROUND',    (1,1), (1,1), C_BLUE_LIGHT),
        ('BACKGROUND',    (2,1), (2,1), C_PURPLE_LIGHT),
        ('BOX',           (0,0), (-1,-1), 1, C_BORDER),
        ('LINEAFTER',     (0,0), (1,-1), 1, C_BORDER),
        ('TOPPADDING',    (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING',   (0,0), (-1,-1), 8),
        ('RIGHTPADDING',  (0,0), (-1,-1), 8),
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
        ('ALIGN',         (0,0), (-1,0), 'CENTER'),
    ])
    arch_t = Table(arch_rows, colWidths=[AVAIL/3]*3)
    arch_t.setStyle(arch_ts)
    story.append(arch_t)
    story.append(Spacer(1, 10))

    story.append(Paragraph('What Makes It Smart', STYLES['section']))
    story.append(Paragraph(
        'The intelligence of the system comes from the <b>proximity-based signal clearance algorithm:</b>',
        disclaimer_style))

    smart_rows = []
    smart_items = [
        ('GPS Tracking',         'The ambulance GPS broadcasts its latitude/longitude every second.'),
        ('Distance Calculation', 'The system calculates the distance from the ambulance to every signal on the route using the Haversine formula.'),
        ('Threshold Trigger',    'When distance drops below 280 m, a GREEN command is sent to that signal controller.'),
        ('Reset Trigger',        'When the ambulance moves beyond 350 m past the signal, a RED reset command is sent.'),
        ('Corridor Effect',      'Only one or two signals are green at any moment — creating a moving green corridor just ahead of the ambulance.'),
        ('First-Aid AI',         'While waiting, the victim uses an AI chatbot for immediate first-aid guidance — reducing harm before the ambulance arrives.'),
    ]
    for i, (title, desc) in enumerate(smart_items):
        num_p  = Paragraph(str(i+1), STYLES['step_num'])
        body_p = [Paragraph(f'<b>{title}</b>', STYLES['step_title']),
                  Paragraph(desc, STYLES['step_body'])]
        smart_rows.append([num_p, body_p])

    smart_ts = TableStyle([
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [C_GREEN_LIGHT, C_BLUE_LIGHT, C_GREEN_LIGHT,
                                             C_BLUE_LIGHT, C_GREEN_LIGHT, C_BLUE_LIGHT]),
        ('VALIGN',         (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING',     (0,0), (-1,-1), 7),
        ('BOTTOMPADDING',  (0,0), (-1,-1), 7),
        ('LEFTPADDING',    (0,0), (-1,-1), 6),
        ('RIGHTPADDING',   (0,0), (-1,-1), 8),
        ('LINEBELOW',      (0,0), (-1,-1), 0.4, C_BORDER),
        ('BOX',            (0,0), (-1,-1), 0.8, C_BORDER),
        ('LINEAFTER',      (0,0), (0,-1),  0.4, C_BORDER),
    ])
    smart_t = Table(smart_rows, colWidths=[12*mm, AVAIL - 12*mm])
    smart_t.setStyle(smart_ts)
    story.append(smart_t)
    story.append(Spacer(1, 10))

    # Coming soon box
    coming_title = ParagraphStyle('ct', fontName='Helvetica-Bold', fontSize=14,
                                  textColor=white, alignment=TA_CENTER, leading=20)
    coming_body  = ParagraphStyle('cb2', fontName='Helvetica', fontSize=10.5,
                                  textColor=C_PURPLE_LIGHT, alignment=TA_LEFT, leading=16)
    coming_items = [
        'Real IoT hardware integration with physical traffic signal controllers',
        'Mobile app (Android/iOS) for ambulance drivers with offline maps',
        'Live hospital dashboard with bed availability API from district hospitals',
        'Multi-ambulance coordination — dispatch the nearest available vehicle automatically',
        'WebRTC real-time voice calls between victim and driver',
        'Government portal for monitoring all active emergencies across the district',
        'SMS/WhatsApp alerts to family members with ambulance ETA',
    ]
    coming_data = [
        [Paragraph('Version 2.0 — Coming Soon', coming_title)],
    ] + [[Paragraph(f'  ➤  {item}', coming_body)] for item in coming_items]

    coming_ts = TableStyle([
        ('BACKGROUND',    (0,0), (-1, 0), C_PURPLE),
        ('BACKGROUND',    (0,1), (-1,-1), C_PURPLE_LIGHT),
        ('BOX',           (0,0), (-1,-1), 2,   C_PURPLE),
        ('LINEBELOW',     (0,0), (-1,-1), 0.3, HexColor('#c4b5fd')),
        ('TOPPADDING',    (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING',   (0,0), (-1,-1), 14),
        ('RIGHTPADDING',  (0,0), (-1,-1), 14),
    ])
    coming_t = Table(coming_data, colWidths=[AVAIL])
    coming_t.setStyle(coming_ts)
    story.append(coming_t)

    story.append(PageBreak())

    # ──────────────────────────────────────────────────────────
    # HOW TO TEST THE WEBSITE — STEP BY STEP
    # ──────────────────────────────────────────────────────────
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('How to Test the Website', ParagraphStyle(
        'test_h', fontName='Helvetica-Bold', fontSize=22,
        textColor=C_GREEN, leading=28, spaceAfter=6)))
    story.append(Paragraph('Complete Step-by-Step Testing Guide', ParagraphStyle(
        'test_sub', fontName='Helvetica', fontSize=13,
        textColor=C_MID, leading=20, spaceAfter=8)))
    story.append(hr(color=C_GREEN))
    story.append(Spacer(1, 4))

    story.append(info_box(
        'Follow these steps in order for a complete end-to-end demo. '
        'You need Google Chrome and an internet connection. '
        'The full demo takes about 3-5 minutes.',
        color=C_BLUE, bg=C_BLUE_LIGHT, style='note'))
    story.append(Spacer(1, 10))

    # Phase headers styling
    phase_style = ParagraphStyle('phase', fontName='Helvetica-Bold', fontSize=13,
                                 textColor=white, leading=18)
    phase_sub   = ParagraphStyle('phase_sub', fontName='Helvetica', fontSize=10,
                                 textColor=C_DARK, leading=15, leftIndent=4, spaceAfter=3)

    def phase_header(label, color):
        data = [[Paragraph(label, phase_style)]]
        ts = TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), color),
            ('TOPPADDING',    (0,0), (-1,-1), 7),
            ('BOTTOMPADDING', (0,0), (-1,-1), 7),
            ('LEFTPADDING',   (0,0), (-1,-1), 12),
            ('RIGHTPADDING',  (0,0), (-1,-1), 12),
        ])
        t = Table(data, colWidths=[AVAIL])
        t.setStyle(ts)
        return t

    def test_step(num, action, detail, tip=None, color=C_GREEN_LIGHT):
        num_p    = Paragraph(str(num), STYLES['step_num'])
        action_p = Paragraph(f'<b>{action}</b>', STYLES['step_title'])
        detail_p = Paragraph(detail, STYLES['step_body'])
        body_col = [action_p, detail_p]
        if tip:
            tip_p = Paragraph(f'Tip: {tip}', ParagraphStyle('tp', fontName='Helvetica-Oblique',
                              fontSize=9, textColor=C_BLUE, leading=13))
            body_col.append(tip_p)
        rows = [[num_p, body_col]]
        ts = TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), color),
            ('VALIGN',        (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING',    (0,0), (-1,-1), 7),
            ('BOTTOMPADDING', (0,0), (-1,-1), 7),
            ('LEFTPADDING',   (0,0), (-1,-1), 6),
            ('RIGHTPADDING',  (0,0), (-1,-1), 8),
            ('LINEBELOW',     (0,0), (-1,-1), 0.5, C_BORDER),
            ('BOX',           (0,0), (-1,-1), 0.8, C_BORDER),
            ('LINEAFTER',     (0,0), (0,-1),  0.5, C_BORDER),
        ])
        t = Table(rows, colWidths=[12*mm, AVAIL - 12*mm])
        t.setStyle(ts)
        return t

    # ── PHASE 1: SETUP ──
    story.append(phase_header('PHASE 1  —  Setup (Do This First)', C_DARK))
    story.append(Spacer(1, 3))
    story.append(test_step(1,
        'Open Google Chrome',
        'Make sure you are using Google Chrome browser (not Firefox or Edge). '
        'Chrome is required for voice input (microphone) and real-time communication between pages.',
        tip='If Chrome is not installed, download it from google.com/chrome'))
    story.append(test_step(2,
        'Connect to the Internet',
        'The website needs internet to load map tiles from OpenStreetMap and calculate routes '
        'using the OSRM routing engine. Make sure your Wi-Fi or mobile data is active.',
        color=C_ROW1))
    story.append(test_step(3,
        'Open Two Windows Side by Side',
        'Open Google Chrome and press Ctrl+N to open a second window. '
        'Place them side by side on your screen. '
        'Window 1 = Caller/Victim side. Window 2 = Ambulance Driver side.',
        tip='You can also use Ctrl+Shift+N for a new incognito window as the second window.'))
    story.append(Spacer(1, 10))

    # ── PHASE 2: REPORT EMERGENCY ──
    story.append(phase_header('PHASE 2  —  Report the Emergency (Caller Side)', C_GREEN))
    story.append(Spacer(1, 3))
    story.append(test_step(4,
        'Open index.html in Window 1',
        'In Window 1, open the file index.html. You should see the Team Lifeline landing page '
        'with the ambulance logo, two steps, and a grey "CALL FOR EMERGENCY" button.',
        tip='Double-click index.html in File Explorer, or drag it into Chrome.'))
    story.append(test_step(5,
        'Describe the Emergency (Voice)',
        'Click the red "Hold to Speak" microphone button. When it pulses, speak clearly: '
        '"There has been an accident near the bus stand. One person is injured and bleeding." '
        'Your speech will appear in the text box. Click the button again to stop.',
        tip='If microphone does not work, skip to Step 6 and type instead.',
        color=C_ROW1))
    story.append(test_step(6,
        'OR Type the Emergency Description',
        'Click the textarea below the microphone area and type any emergency description. '
        'Example: "Road accident on NH-44 near Kamareddy flyover. 2 victims injured." '
        'You need at least 4 characters to activate the Call button.'))
    story.append(test_step(7,
        'Share Your Location',
        'Click the blue "Use My Location" button. Chrome will ask permission — click Allow. '
        'Your coordinates will appear in green. If you deny permission, it automatically '
        'uses Kamareddy NH-44 demo coordinates — which is fine for testing.',
        tip='The location display turns green when captured successfully.',
        color=C_ROW1))
    story.append(test_step(8,
        'Press "CALL FOR EMERGENCY"',
        'The large button turns bright green once both description and location are ready. '
        'Click it. The page will automatically redirect to victim.html — this is the '
        'victim tracking dashboard.',
        tip='If the button is still grey, make sure you have filled the description AND clicked Use My Location.'))
    story.append(Spacer(1, 10))

    # ── PHASE 3: DRIVER OPENS DASHBOARD ──
    story.append(phase_header('PHASE 3  —  Driver Opens Dashboard (Window 2)', C_BLUE))
    story.append(Spacer(1, 3))
    story.append(test_step(9,
        'Open ambulance.html in Window 2',
        'In your second Chrome window, open the file ambulance.html. '
        'You should see the "Team Lifeline — Ambulance Driver" dashboard with a sidebar '
        'showing the emergency incident and two route options on the map.',
        color=C_ROW1))
    story.append(test_step(10,
        'Check the Emergency Incident Panel',
        'In the top-left sidebar card (red border), you should see the emergency description '
        'you typed in Step 5 or 6. The caller name and phone number are also displayed. '
        'This confirms the data was passed correctly.',
        tip='If it shows "Loading…", refresh the page. The data is stored in localStorage.'))
    story.append(test_step(11,
        'Review the Route Options on the Map',
        'Look at the map — you should see a green ambulance marker, a red victim pin, '
        'and two route lines: green solid (Route 1, NH-44, BEST) and amber dashed (Route 2). '
        'Traffic signal icons appear along the selected route.',
        tip='Wait 2-3 seconds for OSRM to calculate real road routes. If map is blank, check internet.',
        color=C_ROW1))
    story.append(test_step(12,
        'Select a Route',
        'Click Route 1 (NH-44 Highway) card to keep it selected (it is already the default BEST route). '
        'Or click Route 2 (Town Arterial) to see the alternate path — the map updates instantly.',
        tip='Click each route card to see how the map lines and signal positions change.'))
    story.append(Spacer(1, 10))

    # ── PHASE 4: JOURNEY AND SIGNALS ──
    story.append(phase_header('PHASE 4  —  Start Journey & Watch Smart Signals', HexColor('#7c3aed')))
    story.append(Spacer(1, 3))
    story.append(test_step(13,
        'Press "Go — Start Journey" on Driver Dashboard',
        'Click the large green "Go — Start Journey" button in the driver sidebar. '
        'The ambulance marker will start moving along the route on the map. '
        'The button changes to "Journey in Progress..." and the Live Journey card appears.',
        color=C_PURPLE_LIGHT))
    story.append(test_step(14,
        'Watch the Traffic Signal Icons Change',
        'As the ambulance moves, look at the signal icons on the map. '
        'When the ambulance gets within 280 m of a signal, it turns GREEN (glowing). '
        'After the ambulance passes 350 m beyond it, it reverts to RED. '
        'This is the smart corridor in action.',
        tip='The Signal field in the top HUD also shows the nearest signal name and colour.',
        color=C_ROW1))
    story.append(test_step(15,
        'Check Window 1 (Victim Dashboard) is Updating',
        'Switch to Window 1. The status badge should now say "Ambulance En Route" in green. '
        'The map should show the ambulance moving in real time. '
        'ETA and Distance fields in the sidebar and HUD update every few seconds.',
        tip='If victim dashboard is not updating, both pages must be open in the same Chrome browser session.',
        color=C_PURPLE_LIGHT))
    story.append(test_step(16,
        'Test the First-Aid AI Chatbot (Window 1)',
        'On the victim dashboard, click the "Bleeding" quick button in the chatbot. '
        'The AI will instantly show first-aid steps for severe bleeding. '
        'Try clicking "Fracture", "Unconscious", and "Crash" buttons too. '
        'You can also type any question and press Ask.',
        color=C_ROW1))
    story.append(test_step(17,
        'Test the Call Feature',
        'On either dashboard, press the "Talk with Ambulance Team" (victim) or '
        '"Call Victim / Caller" (driver) button. '
        'A call modal appears. After 2 seconds, a simulated conversation displays '
        'and is read aloud by text-to-speech. Press the red X to close.',
        tip='Make sure your computer speakers or headphones are not muted to hear the voice.',
        color=C_PURPLE_LIGHT))
    story.append(Spacer(1, 10))

    # ── PHASE 5: ARRIVAL AND HOSPITAL ──
    story.append(phase_header('PHASE 5  —  Scene Arrival & Hospital Transfer', C_RED))
    story.append(Spacer(1, 3))
    story.append(test_step(18,
        'Wait for Ambulance to Arrive at Scene',
        'The ambulance animation takes about 25 seconds. When it reaches the victim pin, '
        'the "Arrived at Scene" overlay appears on victim.html '
        'and the driver dashboard shows the Hospital Selection card.',
        tip='On the victim dashboard, a full-screen green overlay says "Ambulance Has Arrived!" — close it to continue watching.',
        color=C_RED_LIGHT))
    story.append(test_step(19,
        'Select a Hospital (Driver Dashboard)',
        'On ambulance.html, the "Select Hospital for Transfer" card appears showing '
        'two hospitals with ICU bed count and OT status. '
        'Click "Select & View Routes" on the RECOMMENDED hospital '
        '(Government Area Hospital, Kamareddy).',
        color=C_ROW1))
    story.append(test_step(20,
        'Choose Hospital Route and Start Transfer',
        'Two hospital routes appear — Route 1 Direct and Route 2 Via Town. '
        'Select Route 1 Direct (BEST) and press the purple "Go — Transfer Patient" button. '
        'The ambulance will start moving to the hospital with smart signal clearance again.',
        tip='Watch the signal icons turning green ahead of the ambulance on the hospital route too.',
        color=C_RED_LIGHT))
    story.append(test_step(21,
        'Mission Complete!',
        'When the ambulance reaches the hospital, the driver dashboard shows: '
        '"Patient Delivered!" with a link to start a new emergency. '
        'The full demo cycle is complete. '
        'To run the demo again, click "New Emergency" or refresh index.html.',
        color=C_ROW1))
    story.append(Spacer(1, 10))

    # Expected results summary
    story.append(Paragraph('Expected Results Summary', STYLES['section']))
    story.append(make_table(
        ['Step', 'What You Should See', 'Status'],
        [
            ['Step 8',  'index.html redirects to victim.html automatically',        'Automatic'],
            ['Step 13', 'Ambulance icon starts moving on the map',                  'Automatic'],
            ['Step 14', 'Signal icons turn green as ambulance approaches them',     'Automatic'],
            ['Step 15', 'Victim dashboard ETA counts down in real time',            'Automatic'],
            ['Step 18', '"Ambulance Has Arrived!" overlay on victim.html',          'Automatic'],
            ['Step 19', 'Hospital selection card appears on driver dashboard',      'Automatic'],
            ['Step 21', '"Patient Delivered!" card on driver dashboard',            'Automatic'],
        ],
        [AVAIL*0.13, AVAIL*0.62, AVAIL*0.25]
    ))
    story.append(Spacer(1, 10))

    story.append(info_box(
        'If anything does not work as expected, refer to Chapter 8 (Troubleshooting) '
        'or check that both windows are open in the SAME Google Chrome browser on the SAME device.',
        color=C_AMBER, bg=C_AMBER_LIGHT, style='warn'))

    story.append(Spacer(1, 14))
    story.append(hr(color=C_GREEN, thickness=1.5))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'Team Lifeline  |  Smart Ambulance Traffic Signal System  |  User Manual v1.0',
        STYLES['footer']))
    story.append(Paragraph(
        'Developed by students of SPR High School, Kamareddy  |  September 2026',
        STYLES['footer']))
    story.append(Paragraph(
        'For support, contact the project team through the school administration.',
        STYLES['footer']))

    # ── Build with page callbacks ────────────────────────────
    doc.build(story,
              onFirstPage=_cover_page,
              onLaterPages=_header_footer)

    print(f'PDF generated: {output_path}')


if __name__ == '__main__':
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'manual.pdf')
    build_pdf(out)
