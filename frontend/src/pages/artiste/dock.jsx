import {
  Activity,
  Component,
  HomeIcon,
  Mail,
  Package,
  ScrollText,
  SunMoon,
} from 'lucide-react';

import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/shadcn-io/dock';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
const data = [
  {
    title: 'Home',
    icon: (
      <HomeIcon className='h-full w-full text-sky-600 dark:text-sky-300' />
    ),
    href: '/artiste',
  },
  {
    title: 'Musiques',
    icon: (
      <Package className='h-full w-full text-green-500 dark:text-green-300' />
    ),
    href: 'musique',
  },
  {
    title: 'Profile',
    icon: (
      <Component className='h-full w-full text-neutral-600 dark:text-neutral-300' />
    ),
    href: 'profile',
  },
  {
    title: 'Activity',
    icon: (
      <Activity className='h-full w-full text-neutral-600 dark:text-neutral-300' />
    ),
    href: '#',
  },
  {
    title: 'Change Log',
    icon: (
      <ScrollText className='h-full w-full text-neutral-600 dark:text-neutral-300' />
    ),
    href: '#',
  },
  {
    title: 'Email',
    icon: (
      <Mail className='h-full w-full text-red-500 dark:text-red-400' />
    ),
    href: '#',
  },
];

export default function AppleStyleDock() {
  return (
    <div className='absolute bottom-2 left-1/2 max-w-full -translate-x-1/2'>
      <Dock className='items-end pb-3 bg-gray-200 dark:bg-transparent dark:border '>
        {data.map((item, idx) => (
          <Link 
            to={item.href}
            key={idx}
          >
              <DockItem
            
            className='aspect-square rounded-full bg-gray-300 dark:bg-neutral-800'
          >
            
            <DockLabel>{item.title}</DockLabel>
            <DockIcon>{item.icon}</DockIcon>
           
            
          </DockItem>
          </Link>
        ))}
      
      </Dock>
    </div>
  );
}