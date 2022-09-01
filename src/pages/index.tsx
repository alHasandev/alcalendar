import type { NextPage } from 'next'
import Head from 'next/head'
import { trpc } from '@/utils/trpc'
import { signIn, signOut, useSession } from 'next-auth/react'

type TechnologyCardProps = {
  name: string
  description: string
  documentation: string
}

const Home: NextPage = () => {
  const hello = trpc.useQuery(['example.hello', { text: 'from tRPC' }])

  return (
    <>
      <Head>
        <title>Alhasandev Calendar</title>
        <meta name="description" content="My internal calendar project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
          Alhasandev <span className="text-purple-300">Calendar</span>
        </h1>
        <p className="text-2xl text-gray-700">This stack uses:</p>
        <div className="grid gap-3 pt-3 mt-3 text-center md:grid-cols-2 lg:w-2/3">
          <TechnologyCard
            name="NextJS"
            description="The React framework for production"
            documentation="https://nextjs.org/"
          />
          <TechnologyCard
            name="TypeScript"
            description="Strongly typed programming language that builds on JavaScript, giving you better tooling at any scale"
            documentation="https://www.typescriptlang.org/"
          />
          <TechnologyCard
            name="TailwindCSS"
            description="Rapidly build modern websites without ever leaving your HTML"
            documentation="https://tailwindcss.com/"
          />
          <TechnologyCard
            name="tRPC"
            description="End-to-end typesafe APIs made easy"
            documentation="https://trpc.io/"
          />
        </div>
        <div className="pt-6 text-2xl text-blue-500 flex justify-center items-center w-full">
          {hello.data ? <p>{hello.data.greeting}</p> : <p>Loading..</p>}
        </div>

        <AuthSection />
      </main>
    </>
  )
}

const TechnologyCard = ({
  name,
  description,
  documentation,
}: TechnologyCardProps) => {
  return (
    <section className="flex flex-col justify-center p-6 duration-500 border-2 border-gray-500 rounded shadow-xl motion-safe:hover:scale-105">
      <h2 className="text-lg text-gray-700">{name}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <a
        className="mt-3 text-sm underline text-violet-500 decoration-dotted underline-offset-2"
        href={documentation}
        target="_blank"
        rel="noreferrer"
      >
        Documentation
      </a>
    </section>
  )
}

const AuthSection = () => {
  const { data: session, status } = useSession()

  if (status === 'loading') return <>Loading...</>

  return (
    <section>
      {status === 'unauthenticated' && (
        <button
          className="px-4 py-2 border rounded-sm"
          onClick={() => signIn()}
        >
          Sign In
        </button>
      )}
      {status === 'authenticated' && (
        <button
          className="px-4 py-2 border rounded-sm"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      )}
      {session?.user && <pre>{JSON.stringify(session.user, null, 2)}</pre>}
    </section>
  )
}

export default Home
