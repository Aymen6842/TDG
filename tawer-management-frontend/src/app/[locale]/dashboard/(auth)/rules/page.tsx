'use client';

import React from "react";

import { useTranslations } from 'next-intl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function RulesPage() {
  const t = useTranslations('rules');
  const sections = t.raw('sections');

  return (
    <main className="min-h-screen bg-background">

      {/* Page Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
              <p className="text-sm text-muted-foreground">{t('company')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        {/* General Principles */}
        <Section
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          title={sections.generalPrinciples.title}
          description={sections.generalPrinciples.description}
          alerts={[
            {
              type: 'primary',
              text: sections.generalPrinciples.important,
              icon: <CheckCircle className="h-4 w-4" />,
            },
          ]}
        />

        {/* Work Mode Policy */}
        <Section
          icon={<Info className="h-6 w-6 text-blue-600" />}
          title={sections.workMode.title}
          content={[
            { label: 'Mandatory', text: sections.workMode.mandatory },
            { label: 'Details', text: sections.workMode.details },
            { label: 'Note', text: sections.workMode.note },
          ]}
          alerts={[
            {
              type: 'warning',
              text: sections.workMode.warning,
              icon: <AlertTriangle className="h-4 w-4" />,
            },
          ]}
        />

        {/* Working Hours */}
        <Section
          icon={<Info className="h-6 w-6 text-blue-600" />}
          title={sections.workingHours.title}
          content={[
            {
              label: sections.workingHours.tawerDev.name,
              items: [
                `${sections.workingHours.tawerDev.days}`,
                `Morning: ${sections.workingHours.tawerDev.morning}`,
                `Break: ${sections.workingHours.tawerDev.break}`,
                `Afternoon: ${sections.workingHours.tawerDev.afternoon}`,
              ],
            },
            {
              label: sections.workingHours.tawerCRV.name,
              items: [
                `${sections.workingHours.tawerCRV.weekday}:`,
                `  Morning: ${sections.workingHours.tawerCRV.weekdayMorning}`,
                `  Break: ${sections.workingHours.tawerCRV.weekdayBreak}`,
                `  Afternoon: ${sections.workingHours.tawerCRV.weekdayAfternoon}`,
                `${sections.workingHours.tawerCRV.saturday}: ${sections.workingHours.tawerCRV.saturdayHours}`,
              ],
            },
          ]}
          alerts={[
            {
              type: 'primary',
              text: sections.workingHours.mandatory,
              icon: <CheckCircle className="h-4 w-4" />,
            },
          ]}
        />

        {/* Management Platform */}
        <Section
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          title={sections.platform.title}
          description={sections.platform.description}
          content={[
            { label: 'Critical Rules', text: sections.platform.critical },
            { label: '', text: sections.platform.checkIn },
            { label: '', text: sections.platform.checkOut },
            { label: 'Break Guidelines', text: sections.platform.breakRules },
            { label: '', text: sections.platform.breakCheckOut },
            { label: '', text: sections.platform.breakCheckIn },
          ]}
          alerts={[
            {
              type: 'destructive',
              text: sections.platform.warning,
              icon: <AlertTriangle className="h-4 w-4" />,
            },
          ]}
        />

        {/* Leaves & Holidays */}
        <Section
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          title={sections.leaves.title}
        >
          <div className="space-y-6">
            {/* Paid Leave */}
            <Subsection
              title={sections.leaves.paidLeave.title}
              items={[
                sections.leaves.paidLeave.mandatory,
                sections.leaves.paidLeave.annual,
                sections.leaves.paidLeave.note,
                sections.leaves.paidLeave.planning,
              ]}
            />

            {/* Sick Leave */}
            <Subsection
              title={sections.leaves.sickLeave.title}
              items={[
                sections.leaves.sickLeave.requirement,
                sections.leaves.sickLeave.verification,
              ]}
            />

            {/* Special Leave */}
            <Subsection
              title={sections.leaves.specialLeave.title}
              items={[
                sections.leaves.specialLeave.marriage,
                sections.leaves.specialLeave.birth,
                sections.leaves.specialLeave.circumcision,
              ]}
            />

            {/* Public Holidays */}
            <Subsection
              title={sections.leaves.publicHolidays.title}
              items={sections.leaves.publicHolidays.dates}
            />

          </div>
        </Section>

        {/* Compliance */}
        <Section
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          title={sections.compliance.title}
          alerts={[
            {
              type: 'primary',
              text: sections.compliance.mandatory,
              icon: <CheckCircle className="h-4 w-4" />,
            },
            {
              type: 'destructive',
              text: sections.compliance.warning,
              icon: <AlertTriangle className="h-4 w-4" />,
            },
          ]}
        />
      </div>
    </main>
  );
}

interface SectionProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  content?: Array<{ label?: string; text?: string; items?: string[] }>;
  alerts?: Array<{ type: 'primary' | 'warning' | 'destructive'; text: string; icon: React.ReactNode }>;
  children?: React.ReactNode;
}

function Section({ icon, title, description, content, alerts, children }: SectionProps) {
  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'primary':
        return 'border-primary bg-primary/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'destructive':
        return 'border-destructive bg-destructive/10';
      default:
        return '';
    }
  };

  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center gap-3">
        {icon}
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>

      {description && <p className="mb-4 text-muted-foreground">{description}</p>}

      {content && (
        <div className="mb-6 space-y-3">
          {content.map((item, idx) => (
            <div key={idx}>
              {item.label && <p className="font-semibold text-foreground">{item.label}</p>}
              {item.text && <p className="text-foreground">{item.text}</p>}
              {item.items && (
                <ul className="list-inside list-disc space-y-1 text-foreground">
                  {item.items.map((subItem, subIdx) => (
                    <li key={subIdx}>{subItem}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {alerts && (
        <div className="mb-6 space-y-3">
          {alerts.map((alert, idx) => (
            <Alert key={idx} className={getAlertVariant(alert.type)}>
              {alert.icon}
              <AlertDescription className="text-foreground">{alert.text}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {children}
    </section>
  );
}

interface SubsectionProps {
  title: string;
  items: string[];
}

function Subsection({ title, items }: SubsectionProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/50 p-4">
      <h4 className="mb-3 font-semibold text-foreground">{title}</h4>
      <ul className="list-inside list-disc space-y-2 text-foreground">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
