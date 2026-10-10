<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import ChatCircleIcon from "phosphor-svelte/lib/ChatCircleIcon";
  import HexagonIcon from "phosphor-svelte/lib/HexagonIcon";
  import PlusIcon from "phosphor-svelte/lib/PlusIcon";
  import PlugsIcon from "phosphor-svelte/lib/PlugsIcon";
  import TerminalWindowIcon from "phosphor-svelte/lib/TerminalWindowIcon";

  let chatStarted = $state(false);
</script>

<svelte:head>
  <title>Hive</title>
  <meta name="description" content="Your desktop workspace for AI conversations and tools." />
</svelte:head>

<div class="flex h-dvh bg-background text-foreground">
  <aside class="flex w-60 shrink-0 flex-col border-r bg-muted/30 p-4">
    <div class="mb-8 flex items-center gap-2 px-2 text-lg font-semibold">
      <HexagonIcon size={24} weight="duotone" /> Hive
    </div>
    <Button onclick={() => (chatStarted = true)} class="justify-start gap-2">
      <PlusIcon size={18} /> New chat
    </Button>
    <div class="mt-8 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Conversations</div>
    {#if chatStarted}
      <div class="mt-3 flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
        <ChatCircleIcon size={18} /> New conversation
      </div>
    {:else}
      <p class="px-2 py-3 text-sm text-muted-foreground">Your chats will appear here.</p>
    {/if}
    <div class="mt-auto flex items-center gap-2 border-t pt-4 text-sm text-muted-foreground">
      <PlugsIcon size={18} /> Daemon disconnected
    </div>
  </aside>

  <main class="flex min-w-0 flex-1 flex-col">
    <header class="flex h-16 items-center justify-between border-b px-6">
      <span class="text-sm font-medium">{chatStarted ? "New conversation" : "Workspace"}</span>
      <Badge variant="outline">Offline</Badge>
    </header>
    <div class="flex flex-1 items-center justify-center p-8">
      <div class="max-w-md text-center">
        <div class="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted">
          <ChatCircleIcon size={32} weight="duotone" />
        </div>
        <h1 class="text-2xl font-semibold tracking-tight">{chatStarted ? "Ready for a new conversation" : "A home for your conversations"}</h1>
        <p class="mt-3 text-sm leading-6 text-muted-foreground">Connect your AI daemon to send messages, manage chats, and follow tool execution.</p>
        <div class="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <TerminalWindowIcon size={16} /> Tool activity will appear alongside your chats
        </div>
      </div>
    </div>
    <footer class="mx-auto w-full max-w-3xl px-6 pb-6">
      <div class="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">Connect a daemon to start chatting.</div>
    </footer>
  </main>
</div>
