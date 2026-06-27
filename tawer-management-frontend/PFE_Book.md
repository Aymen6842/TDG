# Mémoire de Fin d'Études
## Conception et Développement d'une Plateforme de Gestion Intégrée avec Intégration de l'API Meta Ads

---

**Établissement :** [Nom de l'établissement]  
**Filière :** Génie Logiciel / Informatique  
**Niveau :** Master / Licence Professionnelle  
**Année Universitaire :** 2025–2026  

**Préparé par :** [Votre Nom]  
**Encadrant :** [Nom de l'encadrant]  
**Entreprise d'accueil :** Tawer  

---

## Dédicace

*À mes parents, pour leur soutien indéfectible tout au long de ce parcours.*  
*À mes encadrants, pour leurs conseils éclairés.*  
*À tous ceux qui m'ont accompagné dans cette aventure.*

---

## Remerciements

Je tiens à exprimer ma profonde gratitude envers mon encadrant académique pour ses orientations précieuses, sa disponibilité et ses conseils techniques qui ont guidé ce travail.

Je remercie également l'équipe de Tawer pour m'avoir accueilli et permis de travailler sur ce projet ambitieux dans un environnement professionnel stimulant.

Mes remerciements vont aussi à l'ensemble du corps enseignant de [Nom de l'établissement] pour la qualité de la formation reçue.

---

## Résumé

Ce mémoire présente la conception et le développement d'une plateforme de gestion intégrée pour l'entreprise Tawer, une agence digitale opérant sur deux pôles : Tawer Dev et Tawer Creative. La plateforme, nommée **Tawer Management System**, est une application web full-stack qui centralise la gestion de projets, le suivi des employés, la gestion des tâches personnelles, et l'administration des campagnes publicitaires Meta Ads.

Le backend est développé avec **NestJS** et **PostgreSQL** via **Prisma ORM**, exposant une API RESTful documentée avec **Swagger**. Le frontend est construit avec **Next.js 16** (App Router) et **React 19**, utilisant une architecture modulaire avec **React Query**, **Zustand** et des composants UI basés sur **Radix UI / Shadcn**.

Le périmètre fonctionnel couvre : l'authentification multi-méthodes (email, Google, Facebook OAuth), la gestion de projets Agile et Freestyle avec tableaux Kanban, le suivi des présences et performances des employés, la gestion d'équipes, et l'intégration complète de l'API Meta (Graph API v25) pour la gestion des campagnes publicitaires, des ensembles de publicités, des insights analytiques, des webhooks et de la Conversions API (CAPI).

**Mots-clés :** NestJS, Next.js, React, Prisma, PostgreSQL, Meta Graph API, Kanban, Gestion de projet, Full-Stack, API RESTful, OAuth.

---

## Abstract

This thesis presents the design and development of an integrated management platform for Tawer, a digital agency operating across two business units: Tawer Dev and Tawer Creative. The platform, called **Tawer Management System**, is a full-stack web application that centralizes project management, employee tracking, personal task management, and Meta Ads campaign administration.

The backend is built with **NestJS** and **PostgreSQL** via **Prisma ORM**, exposing a RESTful API documented with **Swagger**. The frontend is built with **Next.js 16** (App Router) and **React 19**, using a modular architecture with **React Query**, **Zustand**, and UI components based on **Radix UI / Shadcn**.

The functional scope covers: multi-method authentication (email, Google, Facebook OAuth), Agile and Freestyle project management with Kanban boards, employee attendance and performance tracking, team management, and full integration of the Meta API (Graph API v25) for advertising campaign management, ad sets, analytics insights, webhooks, and the Conversions API (CAPI).

**Keywords:** NestJS, Next.js, React, Prisma, PostgreSQL, Meta Graph API, Kanban, Project Management, Full-Stack, RESTful API, OAuth.

---

## Table des Matières

1. Introduction Générale
2. Présentation de l'Organisme d'Accueil
3. Contexte et Problématique
4. État de l'Art
5. Analyse et Spécification des Besoins
6. Conception du Système
7. Réalisation et Implémentation
8. Intégration de l'API Meta Ads
9. Tests et Validation
10. Conclusion et Perspectives

---
