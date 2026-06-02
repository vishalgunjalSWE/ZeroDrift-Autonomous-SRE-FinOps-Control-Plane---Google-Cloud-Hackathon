import json
import urllib.parse

run_id = 'TEST-123'
status = 'SUCCESS'
risk = 'LOW'
risk_score = 2
old_type = 't3.2xlarge'
new_type = 't3.medium'
savings = 100.50

estimated_current_cost = float(savings) * 3 if float(savings) > 0 else 0
new_cost = estimated_current_cost - float(savings)

chart_config = {
    'type': 'bar',
    'data': {
        'labels': ['Before', 'After'],
        'datasets': [{
            'label': 'Monthly Cost ($)',
            'data': [estimated_current_cost, new_cost],
            'backgroundColor': ['#f28b82', '#81c995']
        }]
    },
    'options': {
        'plugins': {
            'legend': {'display': False},
            'datalabels': {'color': '#fff', 'font': {'weight': 'bold'}}
        }
    }
}

chart_url = 'https://quickchart.io/chart?c=' + urllib.parse.quote(json.dumps(chart_config)) + '&w=400&h=200&bkg=transparent'

html_body = f"""
<html>
  <body style="background-color: #0A0A0B; color: #E8EAED; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto; background: #141517; border: 1px solid #2B2D31; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
      <div style="background: #1C1D21; padding: 24px; border-bottom: 1px solid #2B2D31;">
        <h2 style="margin: 0; color: #FFFFFF; font-size: 24px;">ZeroDrift Enterprise</h2>
        <p style="margin: 8px 0 0 0; color: #9AA0A6; font-size: 14px;">Automated FinOps Remediation</p>
      </div>
      <div style="padding: 32px;">
        <div style="display: inline-block; padding: 6px 12px; border-radius: 16px; font-weight: bold; font-size: 12px; margin-bottom: 24px; background: {'#2E151B' if risk_score >= 8 else '#13241C'}; color: {'#F28B82' if risk_score >= 8 else '#81C995'}; border: 1px solid {'#5C2524' if risk_score >= 8 else '#214E34'};">
          {status.replace('_', ' ')} &bull; RISK LEVEL: {risk}
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Run <strong>{run_id}</strong> has been processed by the AI Engine.
        </p>
        
        <div style="background: #0A0A0B; border: 1px solid #2B2D31; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #9AA0A6; text-transform: uppercase; letter-spacing: 1px;">Optimization Detail</h3>
          <p style="margin: 0; font-family: monospace; font-size: 14px; color: #E8EAED; background: #1C1D21; padding: 12px; border-radius: 4px;">
            <span style="color: #F28B82;">{old_type}</span> <br/>
            <span style="color: #9AA0A6;">&darr;</span> <br/>
            <span style="color: #81C995;">{new_type}</span>
          </p>
        </div>
        
        <div style="margin-bottom: 32px;">
            <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #9AA0A6; text-transform: uppercase; letter-spacing: 1px;">Financial Impact (Estimated)</h3>
            <img src="{chart_url}" alt="Cost Chart" style="max-width: 100%; height: auto; border-radius: 8px;" />
            <p style="margin-top: 12px; font-size: 20px; font-weight: bold; color: #81C995;">
              Monthly Savings: ${savings}
            </p>
        </div>

        <a href="http://localhost:3000" style="display: inline-block; background: #8AB4F8; color: #0A0A0B; text-decoration: none; font-weight: bold; padding: 12px 32px; border-radius: 24px; font-size: 16px; transition: all 0.2s;">
          View Details & Approve
        </a>
      </div>
      <div style="background: #0A0A0B; padding: 16px; border-top: 1px solid #2B2D31; color: #5F6368; font-size: 12px;">
        Sent by ZeroDrift Autonomous Engine v7.0
      </div>
    </div>
  </body>
</html>
"""

with open('email_preview.html', 'w', encoding='utf-8') as f:
    f.write(html_body)
print('HTML written to email_preview.html')
