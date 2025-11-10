import Card from '../components/Card';

const Test = () => (
	<Card
		name={['Stellar Tea', 'Common']}
		mainImage={{
			src: '/assets/stellar-tea-001.png',
			alt: 'Stellar Tea illustration',
		}}
		borderColor="oklch(28.55% 0.09665440679544547 265.51146531290146)"
	/>
);

export default Test;
