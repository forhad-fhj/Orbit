import * as React from "react"
import { useForm, type UseFormReturn, type FieldValues, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"

const Form = ({ children, ...formProps }: React.FormHTMLAttributes<HTMLFormElement> & { form?: UseFormReturn<any> }) => {
  return <form {...formProps}>{children}</form>
}

const FormItem = ({ children }: { children: React.ReactNode }) => {
  return <div className="space-y-2">{children}</div>
}

const FormLabel = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return <label {...props} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{children}</label>
}

const FormControl = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

const FormDescription = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

const FormMessage = ({ children }: { children?: React.ReactNode }) => {
  if (!children) return null
  return <p className="text-sm font-medium text-destructive">{children}</p>
}

const FormField = ({ control, name, render }: { control: any, name: string, render: (props: any) => React.ReactNode }) => {
  return <>{render({ field: control.register(name) })}</>
}

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField }