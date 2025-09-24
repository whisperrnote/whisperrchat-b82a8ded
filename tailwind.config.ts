import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
        violet: {
          DEFAULT: "hsl(240, 5.9%, 90%)",
          foreground: "hsl(240, 5.9%, 10%)",
          card: "hsl(240, 10%, 3.9%)",
          "card-foreground": "hsl(240, 5%, 95.9%)",
          popover: "hsl(240, 10%, 3.9%)",
          "popover-foreground": "hsl(240, 5%, 95.9%)",
          primary: "hsl(240, 5.9%, 90%)",
          "primary-foreground": "hsl(240, 5.9%, 10%)",
          secondary: "hsl(240, 3.7%, 15.9%)",
          "secondary-foreground": "hsl(240, 5.9%, 98%)",
          muted: "hsl(240, 3.7%, 15.9%)",
          "muted-foreground": "hsl(240, 5%, 64.9%)",
          accent: "hsl(240, 3.7%, 15.9%)",
          "accent-foreground": "hsl(240, 5.9%, 98%)",
          destructive: "hsl(0, 62.8%, 30.6%)",
          "destructive-foreground": "hsl(0, 85.7%, 97.3%)",
          border: "hsl(240, 3.7%, 15.9%)",
          input: "hsl(240, 3.7%, 15.9%)",
          ring: "hsl(240, 4.9%, 83.9%)",
        },
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				chat: {
					'bubble-sent': 'hsl(var(--chat-bubble-sent))',
					'bubble-sent-foreground': 'hsl(var(--chat-bubble-sent-foreground))',
					'bubble-received': 'hsl(var(--chat-bubble-received))',
					'bubble-received-foreground': 'hsl(var(--chat-bubble-received-foreground))'
				},
				security: {
					DEFAULT: 'hsl(var(--security))',
					foreground: 'hsl(var(--security-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-security': 'var(--gradient-security)',
				'gradient-bg': 'var(--gradient-bg)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;