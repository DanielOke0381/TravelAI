'use client';

import { usePathname, useRouter } from 'next-intl/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React from 'react';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('LanguageSwitcher');

  const onSelectChange = (nextLocale: string) => {
    // This function call tells next-intl to switch the language
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Select defaultValue={locale} onValueChange={onSelectChange}>
        <SelectTrigger className="w-[120px]">
            <SelectValue placeholder={t('label')} />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="en">{t('en')}</SelectItem>
            <SelectItem value="fr">{t('fr')}</SelectItem>
            <SelectItem value="ko">{t('ko')}</SelectItem>
        </SelectContent>
    </Select>
  );
}
