import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';

import '../pages/Test.css';

type CSSVarStyle = CSSProperties & {
	[variable: `--${string}`]: string;
};

type CardProps = {
	name: [string, string];
	mainImage: {
		src: string;
		alt?: string;
	};
	borderColor: string;
};

const Card = ({ name, mainImage, borderColor }: CardProps) => {
	const cardRef = useRef<HTMLElement | null>(null);
	const minimapRef = useRef<HTMLDivElement | null>(null);
	const cardVariables = useMemo(
		() =>
			({
				'--border-color': borderColor,
			}) as CSSVarStyle,
		[borderColor]
	);

	useEffect(() => {
		const cardElement = cardRef.current;
		const minimapElement = minimapRef.current;

		if (!cardElement || !minimapElement) {
			return;
		}

		let timeline: gsap.core.Timeline | null = null;
		const cleanupFns: Array<() => void> = [];

		const rootDataset = document.documentElement.dataset;
		if (!rootDataset.theme) rootDataset.theme = 'dark';
		if (!rootDataset.animate) rootDataset.animate = 'true';
		if (!rootDataset.explode) rootDataset.explode = 'false';

		const resolveBounds = () =>
			rootDataset.explode === 'true'
				? minimapElement.getBoundingClientRect()
				: cardElement.getBoundingClientRect();

		const initialize = () => {
			const syncLight = ({ x, y }: { x: number; y: number }) => {
				const bounds = resolveBounds();

				gsap.set('fePointLight', {
					attr: {
						x: Math.floor(x - bounds.x),
						y: Math.floor(y - bounds.y),
					},
				});
			};

			const updatePointer = ({ x, y }: { x: number; y: number }) => {
				const bounds = resolveBounds();

				const posX = x - bounds.x;
				const posY = y - bounds.y;
				const ratioX = posX / bounds.width - 0.5;
				const ratioY = posY / bounds.height - 0.5;

				const pointerX = Number(gsap.utils.clamp(-1, 1, ratioX * 2).toFixed(2));
				const pointerY = Number(gsap.utils.clamp(-1, 1, ratioY * 2).toFixed(2));

				gsap.set(cardElement, {
					'--pointer-x': pointerX,
					'--pointer-y': pointerY,
				});

				const [firstSpan, secondSpan] = minimapElement.querySelectorAll('span');

				if (firstSpan) firstSpan.textContent = `x: ${pointerX}`;
				if (secondSpan) secondSpan.textContent = `y: ${pointerY}`;

				syncLight({ x, y });
			};

			const pointerHandler = (event: PointerEvent) => {
				updatePointer({ x: event.clientX, y: event.clientY });
			};

			syncLight({
				x: window.innerWidth / 2,
				y: window.innerHeight,
			});

			const flipper =
				cardElement.querySelector<HTMLButtonElement>('button') ?? null;

			const flipHandler = () => {
				if (!flipper) return;
				if (
					cardElement.dataset.active === 'false' ||
					document.documentElement.dataset.explode === 'true'
				)
					return;

				const nextPressed =
					flipper.getAttribute('aria-pressed') === 'false' ? 'true' : 'false';
				flipper.setAttribute('aria-pressed', nextPressed);
			};

			if (flipper) {
				flipper.addEventListener('click', flipHandler);
				cleanupFns.push(() =>
					flipper.removeEventListener('click', flipHandler)
				);
			}

			document.body.addEventListener('pointermove', pointerHandler);
			cleanupFns.push(() =>
				document.body.removeEventListener('pointermove', pointerHandler)
			);

			const prepareStrokeReveal = (selector: string) => {
				const elements = Array.from(
					cardElement.querySelectorAll<SVGPathElement>(selector)
				);

				if (elements.length) {
					gsap.set(elements, {
						strokeDasharray: (_index: number, target: SVGPathElement) =>
							target.getTotalLength(),
						strokeDashoffset: (_index: number, target: SVGPathElement) =>
							target.getTotalLength(),
					});
				}

				return elements;
			};

			const sigPaths = prepareStrokeReveal('.sig');
			const earPaths = prepareStrokeReveal('.ear');
			const eyePaths = prepareStrokeReveal('.eye');
			const nosePaths = prepareStrokeReveal('.nose');

			gsap.set('.glare', {
				xPercent: 100,
			});
			gsap.set(
				[
					'.sticker',
					'.card h3',
					'.card__front img',
					'.watermark',
					'.arrow',
					'.card__badge',
				],
				{
					opacity: 0,
				}
			);

			const activate = () => {
				cardElement.dataset.active = 'true';
				gsap.set(
					[
						cardElement,
						'.watermark',
						'.card__front img',
						'.sticker',
						'.card h3',
						'.arrow',
					],
					{
						clearProps: 'all',
					}
				);
				gsap.set(cardElement, {
					display: 'block',
				});
			};

			const animation = gsap
				.timeline({
					delay: 0.5,
					onComplete: () => {
						const glare = cardElement.querySelector('.glare');
						glare?.remove();
						activate();
					},
				})
				.to('.glare', {
					delay: 0.25,
					xPercent: -100,
					duration: 0.65,
					ease: 'power2.inOut',
				})
				.to(
					'.watermark',
					{
						opacity: 1,
						duration: 0.5,
					},
					'<50%'
				)
				.to(
					'.card__front img',
					{
						opacity: 1,
						duration: 0.5,
					},
					'<'
				)
				.to(
					'.card__badge',
					{
						opacity: 1,
						duration: 0.4,
					},
					'<'
				)
				.to('.sticker', {
					opacity: 1,
					duration: 0.5,
				})
				.to('.card h3', {
					opacity: 1,
				});

			timeline = animation;

			if (sigPaths.length) {
				animation.to(sigPaths, {
					strokeDashoffset: 0,
					duration: 0.8,
					ease: 'power2.in',
				});
			}

			if (earPaths.length) {
				animation.to(earPaths, {
					strokeDashoffset: 0,
					duration: 0.1,
					ease: 'power2.in',
				});
			}

			if (eyePaths.length) {
				animation.to(eyePaths, {
					strokeDashoffset: 0,
					duration: 0.1,
					ease: 'power2.in',
				});
			}

			if (nosePaths.length) {
				animation.to(nosePaths, {
					strokeDashoffset: 0,
					duration: 0.1,
					ease: 'power2.in',
				});
			}

			const fillTargets = [...eyePaths, ...nosePaths];
			if (fillTargets.length) {
				animation.to(fillTargets, {
					fill: 'hsl(45 20% 60%)',
					duration: 0.2,
				});
			}

			animation.to('.arrow', {
				opacity: 0.8,
			});
		};

		try {
			initialize();
		} catch (error) {
			console.error(error);
		}

		return () => {
			cleanupFns.forEach((fn) => fn());
			timeline?.kill();
		};
	}, []);

	const [primaryName, secondaryName] = name;
	const mainImageAlt = mainImage.alt ?? 'Card illustration';

	return (
		<>
			<div className="minimap" ref={minimapRef} style={cardVariables}>
				<div className="minimap__stats">
					<span>x: 0</span>
					<span>y: 0</span>
				</div>
			</div>
			<div className="scene">
				<span className="arrow arrow--debug">
					<span>:hover, tap, drag</span>
					<svg
						viewBox="0 0 122 97"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M116.102 0.0996005C114.952 0.334095 112.7 1.53002 111.433 2.53834C110.869 2.98388 109.368 4.15635 108.077 5.11778C103.455 8.6352 102.61 9.40903 102.187 10.4877C101.39 12.5982 102.798 14.5914 105.097 14.5914C106.13 14.5914 108.241 13.7941 109.696 12.8561C110.424 12.3871 111.01 12.0823 111.01 12.1526C111.01 12.692 107.796 17.8274 106.2 19.8206C102.023 25.0733 95.6642 29.6928 86.2548 34.2889C81.0926 36.8214 77.4555 38.2753 73.9123 39.2367C71.7066 39.823 70.6507 39.9871 67.9053 40.0809C66.0516 40.1513 64.5499 40.1747 64.5499 40.1278C64.5499 40.0809 64.808 38.9788 65.1365 37.6891C65.465 36.3993 65.8404 34.1716 66.0047 32.7647C66.4505 28.3796 65.4884 24.2994 63.4704 22.2359C62.1564 20.8758 60.9363 20.3599 59.0121 20.3599C57.6043 20.3599 57.1115 20.4537 55.7975 21.1103C52.8878 22.5407 50.5648 25.9878 49.5089 30.4197C48.453 34.922 49.2742 38.0877 52.3481 41.1127C53.4744 42.2148 54.46 42.9183 55.9852 43.6921C57.1584 44.2549 58.1439 44.7473 58.1909 44.7708C58.5898 45.0053 54.5304 53.4705 52.0666 57.6211C47.4674 65.3125 39.3486 74.575 30.5728 82.0789C22.2427 89.2309 16.7285 92.4435 9.87677 94.1553C8.28116 94.554 7.13138 94.6478 4.2452 94.6478C1.17131 94.6712 0.608154 94.7181 0.608154 95.023C0.608154 95.234 1.19478 95.5857 2.13337 95.9609C3.54126 96.4768 3.96363 96.5472 7.41296 96.5237C10.5572 96.5237 11.4724 96.4299 13.1149 96.0078C21.7265 93.6863 31.1594 87.1908 42.6102 75.7006C49.2977 69.0175 52.5828 64.9373 56.1494 58.9343C58.0501 55.7217 60.6312 50.6801 61.7575 47.9365L62.5553 45.9902L64.0806 46.1543C71.3547 46.9047 77.7136 45.3101 88.3667 40.034C96.2274 36.1414 101.976 32.3426 106.505 28.0748C108.617 26.0816 111.855 22.2828 112.794 20.7117C113.028 20.313 113.286 19.9847 113.357 19.9847C113.427 19.9847 113.662 20.782 113.873 21.72C114.084 22.6814 114.647 24.276 115.093 25.2609C115.82 26.8085 116.008 27.043 116.454 26.9727C116.876 26.9258 117.228 26.4333 117.956 24.9795C119.317 22.2828 119.833 20.2661 120.772 13.8879C121.757 7.25168 121.781 4.4143 120.889 2.56179C119.95 0.615488 118.12 -0.322489 116.102 0.0996005ZM60.7016 25.7767C61.4525 26.9023 61.8279 29.2942 61.6637 31.9205C61.4759 34.7813 60.5139 38.9788 60.0681 38.9788C59.5284 38.9788 57.1584 37.6422 56.2198 36.8214C54.8354 35.6021 54.3426 34.2889 54.5538 32.2957C54.8589 29.2473 56.1964 26.2223 57.5808 25.3547C58.7306 24.6512 60.0681 24.8388 60.7016 25.7767Z"
							fill="currentColor"
						/>
					</svg>
				</span>
				<article
					className="card"
					data-active="false"
					ref={cardRef}
					style={cardVariables}
				>
					<button
						aria-label="Flip card"
						aria-pressed="false"
						type="button"
					></button>
					<div className="card__content">
						<div className="card__rear card__face">
							<img
								className="backdrop"
								src="https://assets.codepen.io/605876/techtrades-backdrop.png"
								alt=""
							/>
							<div className="card__emboss">
								<div className="wordmark">
									<img
										src="https://assets.codepen.io/605876/techtrades-wordmark.png"
										alt="Tech Trades"
									/>
								</div>
								<div className="wordmark">
									<img
										src="https://assets.codepen.io/605876/techtrades-wordmark.png"
										alt="Tech Trades"
									/>
								</div>
								<img
									className="gemstone"
									src="/assets/stellar-tea-icon.png"
									alt=""
								/>
							</div>
							<div className="spotlight"></div>
						</div>
						<div className="card__front">
							<div className="pattern">
								<div className="refraction"></div>
								<div className="refraction"></div>
							</div>
							<div className="card__frame card__emboss">
								<h3>
									<span>{primaryName}</span>
									<br />
									<span>{secondaryName}</span>
								</h3>
								<svg
									className="signature"
									viewBox="0 0 271 209"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										className="sig"
										d="M40.3725 26.8984C58.6558 41.1564 141.659 43.1867 128.248 5.48254C127.911 4.53766 127.085 2.2403 125.938 2.0095C124.714 1.76297 121.929 6.39448 121.627 6.82375C100.965 36.1863 95.2641 73.5992 74.5923 102.644C63.7045 117.942 14.7891 145.678 5.55986 113.481C-17.5939 32.705 78.7483 76.0672 105.741 67.4678C119.757 63.0021 125.297 50.6825 132.831 39.1622C135.218 35.5126 137.628 24.6153 140.043 28.2467C144.771 35.3581 119.642 69.8761 115.559 78.4692C110.959 88.1482 129.228 46.7461 136.796 54.3333C146.229 63.7897 128.236 82.7359 153.367 61.6804C157.634 58.1059 166.582 46.4029 161.033 46.8455C153.977 47.4085 141.565 67.0198 151.685 70.0327C161.531 72.9635 176.039 38.7196 174.012 48.7901C173.009 53.769 168.343 67.3695 175.978 68.9069C186.537 71.0328 191.574 35.8659 197.537 44.8359C240.356 109.24 81.7126 283.324 50.2184 167.261C25.2159 75.1229 240.563 89.2082 268.88 137.08"
										stroke="currentColor"
										strokeWidth="4"
										strokeMiterlimit="10"
										strokeLinecap="round"
										strokeLinejoin="round"
										pathLength={1}
										style={{ '--path-speed': '0.831875' } as CSSVarStyle}
									></path>
									<path
										className="ear"
										d="M187.183 101.246C182.107 82.5407 155.739 77.9455 151.5 99"
										stroke="currentColor"
										strokeWidth="4"
										strokeMiterlimit="10"
										strokeLinecap="round"
										strokeLinejoin="round"
										pathLength={1}
										style={
											{
												'--path-speed': '0.031875',
												'--path-delay': '0.831875',
											} as CSSVarStyle
										}
									></path>
									<path
										className="ear"
										d="M117.998 100.704C117.998 91.1516 103.912 87.3662 96.5585 89.3717C84.7816 92.5836 80.6315 99.053 80.6315 110.505"
										stroke="currentColor"
										strokeWidth="4"
										strokeMiterlimit="10"
										strokeLinecap="round"
										strokeLinejoin="round"
										pathLength={1}
										style={
											{
												'--path-speed': '0.035625',
												'--path-delay': '0.86375',
											} as CSSVarStyle
										}
									></path>
									<path
										className="eye"
										d="M170.025 108.347C168.627 105.551 162.781 110.631 165.494 114.577C168.207 118.523 173.936 114.091 171.643 109.965C171.035 108.871 168.547 107.832 167.355 108.428"
										stroke="currentColor"
										strokeWidth="4"
										strokeMiterlimit="10"
										strokeLinecap="round"
										strokeLinejoin="round"
										pathLength={1}
										style={
											{
												'--path-speed': '0.0175',
												'--path-delay': '0.899375',
											} as CSSVarStyle
										}
									></path>
									<path
										className="eye"
										d="M102.952 112.797C97.2672 112.797 96.7371 120.527 102.224 119.917C108.363 119.235 105.409 110.012 100.363 113.04"
										stroke="currentColor"
										strokeWidth="4"
										strokeMiterlimit="10"
										strokeLinecap="round"
										strokeLinejoin="round"
										pathLength={1}
										style={
											{
												'--path-speed': '0.01625',
												'--path-delay': '0.916875',
											} as CSSVarStyle
										}
									></path>
									<path
										className="nose"
										d="M144.745 123.82C146.652 122.562 141.479 121.621 140.561 121.402C136.485 120.429 124.736 118.793 124.42 125.721C123.695 141.628 160.767 131.457 140.492 121.735"
										stroke="currentColor"
										strokeWidth="4"
										strokeMiterlimit="10"
										strokeLinecap="round"
										strokeLinejoin="round"
										pathLength={1}
										style={
											{
												'--path-speed': '0.04',
												'--path-delay': '0.933125',
											} as CSSVarStyle
										}
									></path>
								</svg>
								<div className="card__badge">
									<img src="/stellar-tea-icon.png" alt="Stellar Tea icon" />
								</div>
								<div className="card__main">
									<img src={mainImage.src} alt={mainImageAlt} />
								</div>
							</div>
							<div className="glare-container">
								<div className="glare"></div>
							</div>
						</div>
					</div>
				</article>
			</div>
			<svg className="sr-only" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<filter id="lighting">
						<feGaussianBlur
							in="SourceAlpha"
							stdDeviation="2"
							result="blur"
						></feGaussianBlur>
						<feSpecularLighting
							result="lighting"
							in="blur"
							surfaceScale="8"
							specularConstant="12"
							specularExponent="120"
							lightingColor="hsl(0 0% 6%)"
						>
							<fePointLight x="50" y="50" z="300"></fePointLight>
						</feSpecularLighting>
						<feComposite
							in="lighting"
							in2="SourceAlpha"
							operator="in"
							result="composite"
						></feComposite>
						<feComposite
							in="SourceGraphic"
							in2="composite"
							operator="arithmetic"
							k1="0"
							k2="1"
							k3="1"
							k4="0"
							result="litPaint"
						></feComposite>
					</filter>
					<filter id="sticker">
						<feMorphology
							in="SourceAlpha"
							result="dilate"
							operator="dilate"
							radius="2"
						></feMorphology>
						<feFlood
							floodColor="hsl(0 0% 100%)"
							result="outlinecolor"
						></feFlood>
						<feComposite
							in="outlinecolor"
							in2="dilate"
							operator="in"
							result="outlineflat"
						></feComposite>
						<feMerge result="merged">
							<feMergeNode in="outlineflat"></feMergeNode>
							<feMergeNode in="SourceGraphic"></feMergeNode>
						</feMerge>
					</filter>
				</defs>
			</svg>
		</>
	);
};

export default Card;
