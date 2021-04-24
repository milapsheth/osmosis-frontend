const spacing = {
	0: '0px',
	0.25: '1px',
	0.5: '2px',
	0.75: '3px',
	1: '4px',
	1.25: '5x',
	1.5: '6px',
	2: '8px',
	2.5: '10px',
	3: '12px',
	3.75: '15px',
	4: '16px',
	5: '20px',
	6: '24px',
	7: '28px',
	8: '32px',
	10: '40px',
	12.5: '50px',
	15: '60px',
	17.5: '70px',
};
const sizes = {
	0: '0px',
	3: '0.75rem',
	3.5: '0.875rem',
	4: '1rem',
	4.5: '1.125rem',
	5: '1.25rem',
	6: '1.5rem',
	7: '1.75rem',
	8: '2rem',
	9: '2.25rem',
	10: '2.5rem',
	11: '2.75rem',
	12: '3rem',
	13: '3.25rem',
	14: '3.5rem',
	15: '3.75rem',
	16: '4rem',
	18: '4.5rem',
	20: '5rem',
	24: '6rem',
	28: '7rem',
	30: '7.5rem',
	32: '8rem',
	40: '10rem',
	50: '12.5rem',
	75: '18.75rem',
	150: '37.5rem',
};
const screenWidths = {
	// 'screen-md': 'var(--screens-md)',
	'screen-lg': 'var(--screens-lg)',
};
const sidebarWidths = {
	'sidebar-open': 'var(--sidebar-open)',
	'sidebar-closed': 'var(--sidebar-closed)',
};
module.exports = {
	future: {
		removeDeprecatedGapUtilities: false,
		purgeLayersByDefault: false,
	},
	purge: ['./components/**/*.js', './pages/**/*.js', './constants/**/*.js'],
	theme: {
		fontFamily: {
			title: ['Poppins', 'ui-sans-serif', 'system-ui'],
			body: ['Inter', 'ui-sans-serif', 'system-ui'],
		},
		fontSize: {
			xs: '12px',
			sm: '14px',
			base: '16px',
			lg: '20px',
			xl: '24px',
			'2xl': '36px',
			'3xl': '48px',
			'4xl': '60px',
			'5xl': '96px',
		},
		boxShadow: {
			container: '0px 8px 10px rgba(0, 0, 0, 0.14), 0px 3px 14px rgba(0, 0, 0, 0.12), 0px 5px 5px rgba(0, 0, 0, 0.2)',
		},
		colors: {
			white: {
				high: 'rgba(255, 255, 255, 0.95)',
				mid: 'rgba(255, 255, 255, 0.6)',
				disabled: 'rgba(255, 255, 255, 0.38)',
			},
			primary: {
				50: '#8A86FF',
				100: '#4540D8',
				200: '#322DC2',
				300: '#2722BB',
				400: '#1D18A8',
				500: '#16119E',
				600: '#110D8B',
				700: '#0A0674',
				800: '#080559',
				900: '#02003F',
			},
			primaryVariant: '#0A0674',
			secondary: {
				50: '#F4CC82',
				100: '#D9B575',
				200: '#C4A46A',
				300: '#BC9856',
				400: '#B88E42',
				500: '#AA7E2D',
				600: '#9C701D',
				700: '#92630B',
				800: '#875903',
				900: '#734B00',
			},
			background: '#170F34',
			surface: '#231D4B',
			card: '#2D2755',
			iconDefault: '#8E83AA',
			error: '#CF6679',
		},
		backgroundColor: themes => ({
			...themes('colors'),
			container: {
				hover: 'rgba(255, 255, 255, 0.04)',
				focus: 'rgba(255, 255, 255, 0.12)',
				selected: 'rgba(255, 255, 255, 0.08)',
			},
		}),
		screens: {
			// sm: '820px',
			// base: '1060px',
			// md: 'var(--screens-md)',
			lg: 'var(--screens-lg)',
		},
		spacing: {
			...spacing,
		},
		extend: {
			height: {
				...sizes,
				screen: '100vh',
			},
			minHeight: {
				...sizes,
				screen: '100vh',
				'sidebar-minHeight': 'var(--sidebar-minHeight)',
			},
			maxHeight: {
				...sizes,
				screen: '100vh',
			},
			width: {
				...sizes,
				...screenWidths,
			},
			minWidth: {
				...screenWidths,
				...sidebarWidths,
			},
			maxWidth: {
				...sizes,
				...screenWidths,
				...sidebarWidths,
			},
			borderOpacity: {
				75: '0.75',
			},
			zIndex: {
				50: 50,
				60: 60,
				70: 70,
				80: 80,
				90: 90,
				100: 100,
			},
			variants: {
				display: ['responsive', 'hover', 'group-hover'],
				opacity: ['hover'],
				borderWidth: ['hover', 'responsive'],
				backgroundColor: ['even', 'hover'],
				fontSize: ['responsive'],
				zIndex: ['hover'],
			},
		},
	},
	plugins: [require('tailwindcss'), require('precss'), require('autoprefixer')],
};
