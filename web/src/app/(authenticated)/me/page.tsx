'use client';

import { trpc } from '@/lib/trpc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';

export default function ProfilePage() {
  const { data, isLoading } = trpc.user.me.useQuery();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="relative">
          {data?.user?.banner && (
            <div className="absolute inset-0 h-32 w-full overflow-hidden">
              <Image
                src={data.user.banner}
                alt="Profile Banner"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="relative z-10 flex items-center gap-4">
            {data?.user?.image ? (
              <Image
                src={data.user.image}
                alt="Profile"
                width={96}
                height={96}
                className="rounded-full border-4 border-white object-cover shadow-lg"
                unoptimized
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200" />
            )}
            <div>
              <CardTitle className="flex items-center gap-2">
                {data?.user?.displayName || data?.user?.name}
                <span className="text-sm text-gray-500">
                  #{data?.user?.discriminator}
                </span>
              </CardTitle>
              <CardDescription>{data?.user?.customStatus}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-4 space-y-6">
          {data?.user?.bio && (
            <div>
              <h3 className="mb-2 text-lg font-semibold">About Me</h3>
              <p className="text-gray-600">{data.user.bio}</p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Display Name
                  </p>
                  <p className="text-lg">{data?.user?.displayName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg">{data?.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pronouns</p>
                  <p className="text-lg">
                    {data?.user?.pronouns || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </p>
                  <p className="text-lg">
                    {data?.user?.dateOfBirth
                      ? new Date(data.user.dateOfBirth).toLocaleDateString()
                      : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Preferences & Status
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-lg capitalize">{data?.user?.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Current Activity
                  </p>
                  <p className="text-lg">
                    {data?.user?.currentActivity || 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Direct Messages
                  </p>
                  <p className="text-lg">
                    {data?.user?.enableDM ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                {data?.user?.accentColor && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Accent Color
                    </p>
                    <div
                      className="mt-1 h-6 w-12 rounded"
                      style={{ backgroundColor: data.user.accentColor }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Account Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Member since
                </p>
                <p className="text-lg">
                  {data?.user?.createdAt
                    ? new Date(data.user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Online</p>
                <p className="text-lg">
                  {data?.user?.lastOnline
                    ? new Date(data.user.lastOnline).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
              {data?.user?.premiumSince && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Premium Member Since
                  </p>
                  <p className="text-lg">
                    {new Date(data.user.premiumSince).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
