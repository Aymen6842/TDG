"use client";

import Image from "next/image";

interface LoadingProps {
  message?: string;
  className?: string;
}

export default function Loading({ message, className }: LoadingProps) {
  return (
    <div
      className={`flex min-h-screen w-full items-center justify-center bg-background ${className || ""
        }`}>
      <div className="flex flex-col items-center space-y-8">
        {/* Company Logo */}
        <div
          className="relative h-20"
          style={{
            opacity: 1,
            animation: "fade-in-scale 1s ease-out 1 forwards"
          }}>
          <Image
            src="/images/company-logo.png"
            alt="Company Logo"
            width={853}
            height={390}
            className="h-full w-auto object-contain"
            priority
          />
        </div>

        {/* Premium animated spinner */}
        <div className="relative h-16 w-16">
          {/* Outer ring - subtle background */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-muted-foreground opacity-15"
            />
          </svg>

          {/* Animated primary circle */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              animation: "spin-loader 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite"
            }}>
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="44 176"
              strokeDashoffset="0"
              strokeLinecap="round"
              className="text-primary"
            />
          </svg>
        </div>

        {/* Loading text */}
        {message && (
          <div className="text-center">
            <p className="text-sm font-medium tracking-wide text-foreground">
              {message}
            </p>
          </div>
        )}

        {/* Subtle loading indicator dots */}
        <div className="flex items-center gap-1.5">
          <div
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{
              animation: "pulse-dot 1.4s ease-in-out infinite"
            }}
          />
          <div
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{
              animation: "pulse-dot 1.4s ease-in-out 0.2s infinite"
            }}
          />
          <div
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{
              animation: "pulse-dot 1.4s ease-in-out 0.4s infinite"
            }}
          />
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes fade-in-scale {
                0% {
                  opacity: 0;
                  transform: scale(0.95);
                }
                100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              @keyframes spin-loader {
                0% {
                  stroke-dasharray: 44 176;
                  stroke-dashoffset: 0;
                  transform: rotate(0deg);
                }
                50% {
                  stroke-dasharray: 110 110;
                  stroke-dashoffset: -50px;
                }
                100% {
                  stroke-dasharray: 44 176;
                  stroke-dashoffset: -176px;
                  transform: rotate(360deg);
                }
              }

              @keyframes pulse-dot {
                0%, 60%, 100% {
                  opacity: 0.4;
                  transform: scale(0.8);
                }
                30% {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `
          }}
        />
      </div>
    </div>
  );
}
