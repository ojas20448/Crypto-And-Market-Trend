export type VariantProps<T extends (...args: any) => any> = Omit<Parameters<T>[0], "class" | "className">

export function cva(
  base: string,
  config?: { variants?: Record<string, Record<string, string>>; defaultVariants?: Record<string, string> },
) {
  return (props?: Record<string, any>) => {
    if (!props || !config?.variants) return base

    let classes = base

    for (const [variantName, variantValue] of Object.entries(props)) {
      if (variantName === "class" || variantName === "className") continue

      const variant = config.variants[variantName]
      if (variant && variantValue && variant[variantValue as string]) {
        classes += ` ${variant[variantValue as string]}`
      } else if (config.defaultVariants?.[variantName]) {
        const defaultValue = config.defaultVariants[variantName]
        if (variant && variant[defaultValue]) {
          classes += ` ${variant[defaultValue]}`
        }
      }
    }

    return classes
  }
}
