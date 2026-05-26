
/** @type {import('next').NextConfig} */

const nextConfig = {
    output: 'standalone',

    async redirects() {
        return [
            {
                source: '/onboarding/basic-info',
                destination: '/onboarding/workspace',
                permanent: true,
            },
            {
                source: '/onboarding/compliance',
                destination: '/onboarding/workspace',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
