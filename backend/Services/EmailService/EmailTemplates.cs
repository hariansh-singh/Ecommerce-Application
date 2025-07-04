using System;
using System.Globalization;

namespace backend.Services.EmailTemplates
{
    public static class EmailTemplateService
    {
        // Helper to convert UTC DateTime to IST
        private static string ConvertToIST(DateTime utcDateTime)
        {
            // Windows: "India Standard Time", Linux/macOS: "Asia/Kolkata"
            TimeZoneInfo istZone;
            try
            {
                istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            }
            catch (TimeZoneNotFoundException)
            {
                istZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata");
            }
            DateTime istTime = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, istZone);
            return istTime.ToString("MMM dd, yyyy - HH:mm", CultureInfo.InvariantCulture) + " IST";
        }

        public static string GetLoginEmailTemplate(string userName, string location, string device)
        {
            return $@"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Login Confirmation - Sha.in</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }}
        .logo {{
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: 2px;
        }}
        .tagline {{
            font-size: 14px;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .welcome-message {{
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 20px;
            font-weight: 600;
        }}
        .login-info {{
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }}
        .login-details {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }}
        .detail-label {{
            font-weight: 600;
            color: #5a6c7d;
        }}
        .detail-value {{
            color: #2c3e50;
            font-weight: 500;
        }}
        .security-note {{
            background-color: #e8f4fd;
            border: 1px solid #b8daff;
            padding: 15px;
            border-radius: 8px;
            margin: 25px 0;
        }}
        .security-icon {{
            color: #0066cc;
            font-size: 18px;
            margin-right: 8px;
        }}
        .cta-section {{
            text-align: center;
            margin: 30px 0;
        }}
        .cta-button {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            transition: transform 0.3s ease;
        }}
        .cta-button:hover {{
            transform: translateY(-2px);
        }}
        .features {{
            display: flex;
            justify-content: space-around;
            margin: 30px 0;
            flex-wrap: wrap;
        }}
        .feature {{
            text-align: center;
            flex: 1;
            min-width: 150px;
            margin: 10px;
        }}
        .feature-icon {{
            font-size: 24px;
            color: #667eea;
            margin-bottom: 10px;
        }}
        .feature-text {{
            font-size: 14px;
            color: #5a6c7d;
            font-weight: 500;
        }}
        .footer {{
            background-color: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .footer-links {{
            margin: 20px 0;
        }}
        .footer-link {{
            color: #bdc3c7;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
        }}
        .footer-link:hover {{
            color: white;
        }}
        .social-icons {{
            margin: 20px 0;
        }}
        .social-icon {{
            display: inline-block;
            margin: 0 10px;
            color: #bdc3c7;
            font-size: 20px;
            text-decoration: none;
        }}
        .copyright {{
            font-size: 12px;
            color: #95a5a6;
            margin-top: 20px;
        }}
        @media (max-width: 600px) {{
            .container {{
                margin: 0;
                border-radius: 0;
            }}
            .header, .content, .footer {{
                padding: 20px;
            }}
            .features {{
                flex-direction: column;
            }}
            .login-details {{
                flex-direction: column;
                align-items: flex-start;
            }}
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <!-- Header -->
        <div class=""header"">
            <div class=""logo"">SHA.IN</div>
            <div class=""tagline"">Premium E-Commerce Experience</div>
        </div>

        <!-- Main Content -->
        <div class=""content"">
            <h1 class=""welcome-message"">Welcome back, {userName}! 👋</h1>
            
            <p style=""font-size: 16px; color: #5a6c7d; margin-bottom: 25px;"">
                Great to see you again! You've successfully logged into your Sha.in account.
            </p>

            <!-- Login Information -->
            <div class=""login-info"">
                <div class=""login-details"">
                    <span class=""detail-label"">🕐 Login Time: </span>
                    <span class=""detail-value"">{ConvertToIST(DateTime.UtcNow)}</span>
                </div>
                <div class=""login-details"">
                    <span class=""detail-label"">🌐 Location: </span>
                    <span class=""detail-value"">{location}</span>
                </div>
                <div class=""login-details"">
                    <span class=""detail-label"">📱 Device: </span>
                    <span class=""detail-value"">{device}</span>
                </div>
            </div>

            <!-- Security Note -->
            <div class=""security-note"">
                <span class=""security-icon"">🔒</span>
                <strong>Security Notice:</strong> If this wasn't you, please secure your account immediately by changing your password.
            </div>

            <!-- Call to Action -->
            <div class=""cta-section"">
                <a href=""https://sha.in/dashboard"" class=""cta-button"">Continue Shopping</a>
            </div>

            <!-- Features -->
            <div class=""features"">
                <div class=""feature"">
                    <div class=""feature-icon"">🛍️</div>
                    <div class=""feature-text"">Latest Products</div>
                </div>
                <div class=""feature"">
                    <div class=""feature-icon"">⚡</div>
                    <div class=""feature-text"">Fast Delivery</div>
                </div>
                <div class=""feature"">
                    <div class=""feature-icon"">🎁</div>
                    <div class=""feature-text"">Exclusive Deals</div>
                </div>
            </div>

            <p style=""font-size: 14px; color: #7f8c8d; text-align: center; margin-top: 30px;"">
                Thank you for choosing Sha.in - Where shopping meets excellence!
            </p>
        </div>

        <!-- Footer -->
        <div class=""footer"">
            <div class=""footer-links"">
                <a href=""https://sha.in/support"" class=""footer-link"">Customer Support</a>
                <a href=""https://sha.in/privacy"" class=""footer-link"">Privacy Policy</a>
                <a href=""https://sha.in/terms"" class=""footer-link"">Terms of Service</a>
            </div>
            
            <div class=""social-icons"">
                <a href=""#"" class=""social-icon"">📘</a>
                <a href=""#"" class=""social-icon"">🐦</a>
                <a href=""#"" class=""social-icon"">📷</a>
                <a href=""#"" class=""social-icon"">💼</a>
            </div>
            
            <div class=""copyright"">
                © 2025 Sha.in - All rights reserved.<br>
                This email was sent to you because you logged into your account.
            </div>
        </div>
    </div>
</body>
</html>";
        }

        // Overloaded method for backward compatibility
        public static string GetLoginEmailTemplate(string userName, string userEmail, DateTime loginTime)
        {
            return GetLoginEmailTemplate(userName, "Unknown Location", "Web Browser");
        }

        // You can add more email templates here
        public static string GetWelcomeEmailTemplate(string userName)
        {
            // Welcome email template
            return "<!-- Welcome template here -->";
        }

        public static string GetPasswordResetTemplate(string userName, string resetLink)
        {
            // Password reset template
            return "<!-- Password reset template here -->";
        }
    }
}