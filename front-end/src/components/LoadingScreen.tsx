export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="container">
          <div className="center">
            <svg>
              <defs>
                <clipPath id="clip-logo">
                  <path className="clip">
                    {/* Animation for morphing path */}
                    <animate 
                      id="morph-one" 
                      dur="2" 
                      begin="0" 
                      repeatCount="indefinite" 
                      attributeName="d" 
                      from="M244.5 0H0v158.8c15.5.6 16.2 7.7 33.2 7.7 17.8 0 17.8-7 35.5-7 17.8 0 17.8 8.1 35.5 8.1 17.8 0 17.8-10.1 35.5-10.1 17.8 0 17.8 9.5 35.5 9.5 17.8 0 17.8-8.9 35.5-8.9 17.1 0 17.7 7.9 33.5 8.5L244.5 0z" 
                      to="M244.5 0H0v167.6c15.5-.9 16.2-10.6 33.2-10.6 17.8 0 17.8 10.9 35.5 10.9 17.8 0 17.8-9.1 35.5-9.1 17.8 0 17.8 6.7 35.5 6.7 17.8 0 17.8-6.8 35.5-6.8 17.8 0 17.8 7.6 35.5 7.6 17.1 0 17.7-8.5 33.5-9.1L244.5 0z"
                    />
                  </path>
                </clipPath>
              </defs>
              <g clipPath="url(#clip-logo)">
                {/* M */}
                <path className="logo" d="M96 117H27V36H0v108h87z"/>
              </g>
            </svg>
          </div>

          <div className="center">
            <svg>
              <g clipPath="url(#clip-logo)">
                {/* A */}
                <path className="logo" d="M105.2 36h-27l-24 72h27l10.6-31.5 22.4 67.5h27z"/>
              </g>
            </svg>
          </div>

          <div className="center">
            <svg>
              <g clipPath="url(#clip-logo)">
                {/* P */}
                <path className="logo" d="M138.8 108h27l24-72h-27l-10.6 31.5L129.8 0h-27z"/>
              </g>
            </svg>
          </div>

          <div className="center">
            <svg>
              <g clipPath="url(#clip-logo)">
                {/* Y */}
                <path className="logo" d="M244.5 89.7c0-27-19.7-49.3-45.4-53.6l-8.8 26.4c15 0 27.2 12.2 27.2 27.2s-12.2 27.2-27.2 27.2h-46.9c9.4 16.1 26.9 27 46.9 27 29.9.1 54.2-24.2 54.2-54.2z"/>
              </g>
            </svg>
          </div>
        </div>

        <div className="text-white text-xl font-light tracking-wider">Loading Weather Data</div>
      </div>
    </div>
  );
} 