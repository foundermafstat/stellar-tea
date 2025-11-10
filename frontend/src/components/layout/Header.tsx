'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { FiCopy, FiLogOut } from 'react-icons/fi';

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { connectWallet, disconnectWallet } from '@/lib/wallet';
import { useWallet } from '@/lib/hooks/useWallet';
import { useWalletBalance } from '@/lib/hooks/useWalletBalance';
import { useStarsBalance } from '@/lib/hooks/useStarsBalance';

const shortenAddress = (value: string, size = 4) => {
	if (value.length <= size * 2) return value;
	return `${value.slice(0, size)}…${value.slice(-size)}`;
};

const navigationItems = [
	{
		label: 'Marketplace',
		description: 'Trade Stellar Tea collectibles and ingredients.',
		href: '/marketplace',
	},
	{
		label: 'Swap',
		description: 'Exchange XLM for STARS inside the protocol.',
		href: '/swap',
	},
	{
		label: 'Brewing Lab',
		description: 'Craft unique blends using your collected essences.',
		href: '/lab',
	},
	{
		label: 'Lore',
		description: 'Discover the chronicles behind Stellar Tea.',
		href: '/lore',
	},
];

export const Header = () => {
	const { address, isPending } = useWallet();
	const { xlm, isLoading: isBalanceLoading } = useWalletBalance();
	const {
		formatted: starsBalance,
		isLoading: isStarsLoading,
		error: starsError,
	} = useStarsBalance(address);
	const [connecting, startConnecting] = useTransition();
	const [disconnecting, setDisconnecting] = useState(false);

	const isBusy = connecting || isPending;

	const initials = useMemo(
		() => (address ? address.slice(0, 2).toUpperCase() : 'ST'),
		[address]
	);

	const handleConnect = () => {
		startConnecting(async () => {
			try {
				await connectWallet();
			} catch (error) {
				console.error(error);
				toast({
					title: 'Wallet connection failed',
					description:
						'We could not connect to your wallet. Try again in a moment.',
				});
			}
		});
	};

	const handleDisconnect = async () => {
		try {
			setDisconnecting(true);
			await disconnectWallet();
			toast({
				title: 'Wallet disconnected',
				description: 'You can reconnect at any time.',
				dismissible: true,
			});
		} catch (error) {
			console.error(error);
			toast({
				title: 'Unable to disconnect',
				description: 'We could not disconnect the wallet. Please retry.',
			});
		} finally {
			setDisconnecting(false);
		}
	};

	const handleCopy = async () => {
		if (!address) return;
		try {
			await navigator.clipboard.writeText(address);
			toast({
				title: 'Address copied',
				description: 'Wallet address saved to clipboard.',
				dismissible: true,
			});
		} catch (error) {
			console.error(error);
			toast({
				title: 'Copy failed',
				description: 'We could not copy the address. Copy it manually instead.',
			});
		}
	};

	return (
		<header className="sticky top-0 z-40 border-b border-white/40 bg-gradient-to-br from-[#fff4ee]/90 via-[#ffeafd]/85 to-[#f7e3ff]/90 backdrop-blur-xl">
			<div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-4">
				<Link
					href="/"
					className="flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1.5 shadow-[0_12px_30px_rgba(189,140,255,0.18)] transition hover:border-pink-200 hover:bg-white"
				>
					<Image
						src="/design/svg/stellar-tea-icon.svg"
						alt="Stellar Tea"
						width={32}
						height={32}
						className="h-8 w-8"
						priority
					/>
					<span className="text-xl font-semibold tracking-tight text-slate-700">
						Stellar Tea
					</span>
				</Link>

				<nav className="ml-auto hidden flex-1 items-center rounded-full justify-center md:flex">
					<NavigationMenu>
						<NavigationMenuList className="gap-3">
							<NavigationMenuItem>
								<NavigationMenuTrigger className="rounded-full border border-white/60 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-600 shadow-[0_12px_35px_rgba(189,140,255,0.16)] transition hover:border-pink-200 hover:bg-white hover:text-purple-600">
									Explore
								</NavigationMenuTrigger>
								<NavigationMenuContent className="z-50 mx-auto rounded-[30px] border border-white/60 bg-white/90 p-6 shadow-[0_24px_65px_rgba(189,140,255,0.25)] backdrop-blur-2xl">
									<ul className="grid gap-4 md:w-[420px] md:grid-cols-2">
										{navigationItems.map((item) => (
											<li key={item.label}>
												<NavigationMenuLink asChild>
													<Link
														href={item.href}
														className="block select-none rounded-3xl border border-white/60 bg-white/80 p-4 text-left no-underline shadow-[0_12px_30px_rgba(189,140,255,0.18)] outline-none transition hover:border-pink-200 hover:bg-white hover:text-purple-600"
													>
														<div className="text-sm font-semibold leading-none text-slate-700">
															{item.label}
														</div>
														<p className="mt-2 text-xs leading-snug text-slate-500">
															{item.description}
														</p>
													</Link>
												</NavigationMenuLink>
											</li>
										))}
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuLink asChild>
									<Link
										href="/about"
										className="inline-flex h-10 items-center rounded-full border border-white/60 bg-white/80 px-5 text-sm font-semibold text-slate-600 shadow-[0_10px_28px_rgba(189,140,255,0.14)] transition hover:border-pink-200 hover:bg-white hover:text-purple-600"
									>
										About
									</Link>
								</NavigationMenuLink>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuLink asChild>
									<Link
										href="/docs"
										className="inline-flex h-10 items-center rounded-full border border-white/60 bg-white/80 px-5 text-sm font-semibold text-slate-600 shadow-[0_10px_28px_rgba(189,140,255,0.14)] transition hover:border-pink-200 hover:bg-white hover:text-purple-600"
									>
										Docs
									</Link>
								</NavigationMenuLink>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				</nav>

				<div className="flex flex-1 items-center justify-end gap-3 md:flex-none">
					{!address ? (
						<Button
							onClick={handleConnect}
							disabled={isBusy}
							variant="candy"
							className="h-11 px-6 text-xs font-semibold uppercase tracking-[0.28em]"
						>
							{isBusy ? 'Connecting...' : 'Connect Wallet'}
						</Button>
					) : (
						<TooltipProvider>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="flex items-center gap-2 rounded-full border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-[0_12px_35px_rgba(189,140,255,0.16)] hover:border-pink-200 hover:bg-white hover:text-purple-600"
									>
										<Avatar className="h-9 w-9">
											<AvatarFallback>{initials}</AvatarFallback>
										</Avatar>
										<span className="hidden sm:inline-block truncate max-w-[120px]">
											{shortenAddress(address)}
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="z-50 w-72 rounded-3xl border border-white/60 bg-white/90 p-4 shadow-[0_24px_65px_rgba(189,140,255,0.25)] backdrop-blur-2xl"
									align="end"
									sideOffset={12}
								>
									<DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
										Wallet
									</DropdownMenuLabel>
									<div className="px-2 py-1.5 text-sm">
										<p className="font-medium text-foreground">
											Connected account
										</p>
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													onClick={handleCopy}
													className="mt-1 flex w-full items-center gap-2 truncate rounded-md border border-transparent px-2 py-1 text-left text-xs text-muted-foreground transition hover:border-primary/50 hover:bg-accent"
												>
													<FiCopy aria-hidden className="h-4 w-4 shrink-0" />
													<span className="truncate">{address}</span>
												</button>
											</TooltipTrigger>
											<TooltipContent side="bottom">
												Copy address
											</TooltipContent>
										</Tooltip>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link
											href="/profile"
											className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-accent hover:text-purple-600"
										>
											<span>Profile</span>
											<span className="text-xs uppercase tracking-[0.26em] text-slate-400">
												View
											</span>
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<div className="px-2 py-1.5 text-sm">
										<div className="flex items-center justify-between">
											<span className="text-muted-foreground">Balance</span>
											<span className="font-semibold">
												{isBalanceLoading ? '...' : `${xlm} XLM`}
											</span>
										</div>
										<div className="mt-2 flex items-center justify-between">
											<span className="text-muted-foreground">STARS</span>
											<span className="font-semibold">
												{isStarsLoading ? '...' : `${starsBalance} STARS`}
											</span>
										</div>
										{starsError ? (
											<p className="mt-2 text-xs text-destructive/80">
												{starsError}
											</p>
										) : null}
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onSelect={(event) => {
											event.preventDefault();
											void handleDisconnect();
										}}
										className="flex items-center gap-2 text-destructive focus:text-destructive"
										disabled={disconnecting}
									>
										<FiLogOut className="h-4 w-4" aria-hidden />
										{disconnecting ? 'Disconnecting...' : 'Disconnect'}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TooltipProvider>
					)}
				</div>
			</div>
			<Separator />
		</header>
	);
};
