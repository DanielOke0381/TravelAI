"use client";

import { useTranslations } from 'next-intl';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import LanguageSwitcher from '../../../_components/LanguageSwitcher'; // Adjusted path for the new component

/**
 * AppHeader Component
 * * The main application header, displayed within the dashboard layout.
 * It now includes translated navigation links and a language switcher dropdown.
 */
function AppHeader() {
    // Initialize the translation hook with the 'AppHeader' namespace from your JSON files
    const t = useTranslations('AppHeader'); 
    
    // Menu options are now dynamically translated based on the current locale
    const menuOptions = [
        { id: 1, name: t('home'), path: '/dashboard' },
        { id: 2, name: t('history'), path: '/dashboard/history' },
        { id: 4, name: t('profile'), path: '/profile' }
    ];

    return (
        <div className='flex items-center justify-between p-4 shadow px-10 md:px-20 lg:px-40'>
            <Link href='/'>
                <Image src={'/logo.svg'} alt='logo' width={90} height={90} className='cursor-pointer' />
            </Link>
            <div className='hidden md:flex gap-12 items-center'>
                {menuOptions.map((option, index) => (
                    <Link key={index} href={option.path}>
                        <h2 className='hover:font-bold cursor-pointer transition-all'>{option.name}</h2>
                    </Link>
                ))}
            </div>
            {/* Container for the language switcher and user button */}
            <div className='flex items-center gap-4'>
                <LanguageSwitcher />
                <UserButton />
            </div>
        </div>
    )
}

export default AppHeader;
