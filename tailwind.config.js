module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			'brand-5': 'var(--brand-5)',
  			'brand-60': 'var(--brand-60)',
  			'destructive-5': 'var(--destructive-5)',
  			'destructive-50': 'var(--destructive-50)',
  			'gray-30': 'var(--gray-30)',
  			'gray-5': 'var(--gray-5)',
  			'gray-60': 'var(--gray-60)',
  			'gray-80': 'var(--gray-80)',
  			'gray0-white': 'var(--gray0-white)',
  			'success-5': 'var(--success-5)',
  			'success-50': 'var(--success-50)',
  			'warning-5': 'var(--warning-5)',
  			'warning-50': 'var(--warning-50)',
  			white: 'var(--white)',
  			'gray-0': 'var(--gray-0)',
  			'gray-10': 'var(--gray-10)',
  			'gray-20': 'var(--gray-20)',
  			'gray-40': 'var(--gray-40)',
  			'gray-50': 'var(--gray-50)',
  			'gray-70': 'var(--gray-70)',
  			'gray-90': 'var(--gray-90)',
  			'gray-100': 'var(--gray-100)',
  			'brand-primary-50': 'var(--brand-primary-50)',
  			'brand-primary-100': 'var(--brand-primary-100)',
  			'brand-primary-200': 'var(--brand-primary-200)',
  			'brand-primary-300': 'var(--brand-primary-300)',
  			'brand-primary-400': 'var(--brand-primary-400)',
  			'brand-primary-500': 'var(--brand-primary-500)',
  			'brand-primary-600': 'var(--brand-primary-600)',
  			'brand-primary-700': 'var(--brand-primary-700)',
  			'brand-primary-800': 'var(--brand-primary-800)',
  			'brand-primary-900': 'var(--brand-primary-900)',
  			'text-50': 'var(--text-50)',
  			'text-100': 'var(--text-100)',
  			'text-200': 'var(--text-200)',
  			'text-300': 'var(--text-300)',
  			'text-400': 'var(--text-400)',
  			'text-500': 'var(--text-500)',
  			'text-600': 'var(--text-600)',
  			'text-700': 'var(--text-700)',
  			'text-800': 'var(--text-800)',
  			'text-900': 'var(--text-900)',
  			'destructive-10': 'var(--destructive-10)',
  			'destructive-20': 'var(--destructive-20)',
  			'destructive-30': 'var(--destructive-30)',
  			'destructive-40': 'var(--destructive-40)',
  			'destructive-60': 'var(--destructive-60)',
  			'destructive-70': 'var(--destructive-70)',
  			'destructive-80': 'var(--destructive-80)',
  			'destructive-90': 'var(--destructive-90)',
  			'warning-10': 'var(--warning-10)',
  			'warning-20': 'var(--warning-20)',
  			'warning-30': 'var(--warning-30)',
  			'warning-40': 'var(--warning-40)',
  			'warning-60': 'var(--warning-60)',
  			'warning-70': 'var(--warning-70)',
  			'warning-80': 'var(--warning-80)',
  			'warning-90': 'var(--warning-90)',
  			'success-10': 'var(--success-10)',
  			'success-20': 'var(--success-20)',
  			'success-30': 'var(--success-30)',
  			'success-40': 'var(--success-40)',
  			'success-60': 'var(--success-60)',
  			'success-70': 'var(--success-70)',
  			'success-80': 'var(--success-80)',
  			'success-90': 'var(--success-90)',
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
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Gilroy',
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			gilroy: [
  				'Gilroy',
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			'heading-h4-bold': 'var(--heading-h4-bold-font-family)',
  			'heading-h5-bold': 'var(--heading-h5-bold-font-family)',
  			'paragraph-sm': 'var(--paragraph-sm-font-family)',
  			'text-sm-bold': 'var(--text-sm-bold-font-family)',
  			'text-sm-medium': 'var(--text-sm-medium-font-family)',
  			'text-small-normal': 'var(--text-small-normal-font-family)',
  			'text-xs-semibold': 'var(--text-xs-semibold-font-family)',
  			'title-t1-bold': 'var(--title-t1-bold-font-family)',
  			'title-t3-semibold': 'var(--title-t3-semibold-font-family)',
  			'title-t4-bold': 'var(--title-t4-bold-font-family)',
  			'title-t4-semibold': 'var(--title-t4-semibold-font-family)',
  			'title-t5-bold': 'var(--title-t5-bold-font-family)',
  			'title-t5-medium': 'var(--title-t5-medium-font-family)',
  			'title-t6-semibold': 'var(--title-t6-semibold-font-family)',
  			'display-lg-extrabold': 'var(--display-lg-extrabold-font-family)',
  			'display-lg-bold': 'var(--display-lg-bold-font-family)',
  			'display-lg-semibold': 'var(--display-lg-semibold-font-family)',
  			'display-md-extrabold': 'var(--display-md-extrabold-font-family)',
  			'display-md-bold': 'var(--display-md-bold-font-family)',
  			'display-md-semibold': 'var(--display-md-semibold-font-family)',
  			'display-sm-extrabold': 'var(--display-sm-extrabold-font-family)',
  			'display-sm-bold': 'var(--display-sm-bold-font-family)',
  			'display-sm-semibold': 'var(--display-sm-semibold-font-family)'
  		},
  		fontWeight: {
  			'ultra-light': '100',
  			thin: '200',
  			light: '300',
  			normal: '400',
  			medium: '500',
  			semibold: '600',
  			bold: '700',
  			extrabold: '800',
  			heavy: '900',
  			black: '950'
  		},
  		boxShadow: {
  			'shadow-lg': 'var(--shadow-lg)'
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
  	},
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: ["class"],
};
